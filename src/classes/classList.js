import express from "express";
import {isAdminAuthenticated} from "../auth/authMiddleware.js";
import {putExcelValToDB, putDeptValToDB} from "../excel/excel.js";
import db from "../domain/db/dbConfig";
import {getStudentAndExamInfos, getStudentInfosByPNum, getStudentInfoByPNum, getSeoulDeptInfo, getYonseiDeptInfo} from "../domain/db/dbQuery.js";
import { getClassId, getClassNameById, addClassToDB, deleteClassFromDB } from "../domain/db/class/dbClassQuery.js";
import { getStudentPNumByName, getStudentNameByPNum } from '../domain/db/student/dbStudentQuery';
import { getExamInfosById, getExamChartDataById, getCommonExamCount } from "../domain/db/exam/dbExamQuery.js";
import { getCommonExamRound, getProblemInfoByRound, getScoreRule } from "../domain/db/totalExam/dbTotalExamQuery.js";
import { getSeoulDeptList, getYonseiDeptList } from '../domain/db/student/dbStudentDeptQuery.js'
import { makeCommonTestExcel } from "../excel/out/exportExcel";

import wrap from 'express-async-wrap'
import multer from "multer";
import AuthService from "../auth/authService.js";
import TotalExamService from "../domain/service/totalExamService.js";
import ExcelService from "../excel/excelService.js";
import CourseService from "../domain/service/courseService.js";
// import fs from "fs";

const router = express.Router();

const authService = new AuthService();
const totalExamService = new TotalExamService();
const courseService = new CourseService();

//set path to save input excels
const upload = multer({dest: 'excels/'});

//추후에 classdb로 db.query는 분리해야함
router.get("/", isAdminAuthenticated, wrap(async function(req, res) {
    const commonExamCount = await totalExamService.countCommonExam();
    const classes = await courseService.getAllClass();

    console.log(req.user);
    res.render("classList/classes", {classes : classes, user: req.user, commonExamCount : commonExamCount});
}));

router.get("/add", isAdminAuthenticated, function(req, res) {
    res.render("classList/add-class", {user: req.user});
});

router.post("/add-class", isAdminAuthenticated, wrap(async function(req, res) {
    //TODO: 아래를 req바디를 나누고 db에 보내느게 좋을듯
    await courseService.saveClass(req.body.classname);
    
    res.redirect("/classList");
}));

router.get("/export-excel", isAdminAuthenticated, wrap(async function(req, res) {
    await excelService.exportCommonTestExcel(req.query.commonRound);

    const FILE_PATH = "src/excel/output/";
    const FILE_NAME = "testExcel.xlsx";

    res.setHeader(
        'Content-Disposition',
        `attachment; filename= ${FILE_NAME}`,
    );

    res.sendFile('testExcel.xlsx', {root: FILE_PATH});
}));

//TODO: 이 아래는 클래스를 따로 빼야함

router.get("/:id", isAdminAuthenticated, wrap(async function(req, res) {
    const courseId = req.params.id;
    const className = await courseService.getCourseName(courseId);
    const studentList = await studentService.getClassStudentList(courseId);
    const examList = await totalExamService.getClassExamList(courseId);

    console.log(studentList);

    res.render("admin-class/class", {id: req.params.id, studentList: studentList, 
            examList: examList, user: req.user, className: className});
}));

//TODO: 완료가 되면 redirect가 되어야 함 현재 db 넣는 게 async await 처리가 안 되어있음
router.post("/:id/add-score", isAdminAuthenticated, upload.single('excel'), function(req, res) {
    const file = req.file;
    putExcelValToDB(file, req.params.id);
    res.redirect(`/classList/${req.params.id}`);
});

router.post("/:id/add-dept", isAdminAuthenticated, upload.single('excel'), function(req, res) {
    const file = req.file;
    putDeptValToDB(file, req.params.id).then(res.redirect(`/classList/${req.params.id}`));
});

router.get("/:id/student", isAdminAuthenticated, wrap(async function(req, res) {
    const student = await studentService.getStudent(req.query.id);
    const studentExams = await examService.getStudentExams(student.id, req.params.id);

    res.render("admin-class/student-info", {examInfos : studentExams, student : student, user: req.user});
}));

router.get("/:id/student/exam/seoul-dept", function(req, res) {
    // console.log(req.query.round + req.query.name);
    getSeoulDeptInfo(req.params.id, req.query.round, req.query.name).then(seoulDeptInfo => {
        res.send(seoulDeptInfo.seoulChartData);
    });
});

router.get("/:id/student/exam/yonsei-dept", function(req, res) {
    getYonseiDeptInfo(req.params.id, req.query.round, req.query.name).then(yonseiDeptInfo => {
        res.json(yonseiDeptInfo.yonseiChartData);
    });
});

router.get("/:id/student/exam/score-rule", isAdminAuthenticated, function(req, res) {
    getScoreRule(req.query.round, req.params.id).then(scoreRule => {
        // console.log(req.params.id);
        const scoreRuleArr = scoreRule.split(/\r\n|\r|\n/);
        res.render("class/score-rule", {scoreRuleArr : scoreRuleArr, user: req.user, round: req.query.round});
    });
});

router.get("/:id/student/exam/problem-info", isAdminAuthenticated, function(req, res) {
    getStudentPNumByName(req.query.name, req.params.id).then(pNum => {
        getStudentNameByPNum(pNum).then(userInfo => {
            getStudentInfoByPNum(pNum, req.query.round).then(studentInfo => {
                console.log(studentInfo);
                getProblemInfoByRound(req.query.round, req.params.id).then(problemInfo => {
                    res.render("class/problem-info", {username : userInfo.username , round : req.query.round, 
                        studentInfo: studentInfo, problemInfo: problemInfo, userInfo : userInfo, user: req.user});
                });
            });
        });
    });
});

router.get("/:id/exam", isAdminAuthenticated, function(req, res) {
    getCommonExamRound(req.query.round, req.params.id).then(commonRound => {
        getExamInfosById(req.query.round, req.params.id, req.user).then(studentList => res.render("admin-class/exam", 
        {studentList : studentList, round : req.query.round, commonRound : commonRound, user: req.user}));
    });
});

//TODO: 여기도 async await 라우터에서 데코레이터 패턴으로 처리해줘야 할ㄷ듯
router.get("/:id/init-pw", isAdminAuthenticated, function(req, res) {
    getStudentPNumByName(req.query.name, req.params.id).then(pNum => {
        // console.log(pNum);
        authService.initPassword(pNum).then(() => {
            res.redirect(`/classList/${req.params.id}`);
        });
    });
});

router.get("/:id/delete", isAdminAuthenticated, function(req, res) {
    deleteClassFromDB(req.params.id).then( ()=> {
        res.redirect("/classList");
    });
});



export default router;