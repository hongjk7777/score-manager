import express from "express";
import {isAdminAuthenticated, isAuthenticated} from "../auth/auth.js";
import {putExcelValToDB, putDeptValToDB} from "../excel/excel.js";
import db from "../db/dbConfig";
import {getStudentAndExamInfos, getClassId, getStudentInfosByName, getExamInfosById, addClassToDB, 
    deleteClassFromDB,
    getCommonExamRound} from "../db/dbQuery.js";
import multer from "multer";

const router = express.Router();

//set path to save input excels
const upload = multer({dest: 'excels/'});

const MONDAY = 0;
const TUESDAY = 1;
const WEDNESDAY = 2;
const THURSDAY = 3;
const FRIDAY = 4;
const SATURDAY = 5;
const SUNDAY = 6;

function getDayStr(str) {
    let retDay = [];
    
    const days = str.split(',');
    days.forEach(day => {
        retDay.push(getDay(parseInt(day)));
    });

    return retDay.toString();
}

function getDay(str) {

    switch (str) {
        case MONDAY:
            return "월";
        case TUESDAY:
            return "화";
        case WEDNESDAY:
            return "수";
        case THURSDAY:
            return "목";
        case FRIDAY:
            return "금";
        case SATURDAY:
            return "토";
        case SUNDAY:
            return "일";
    }
}

function trnasferJsonToDayStr(json) {
    let dayStr = [];
    if(json.monday) {
        dayStr.push(MONDAY);
    }
    if(json.tuesday) {
        dayStr.push(TUESDAY);
    }
    if(json.wednesday) {
        dayStr.push(WEDNESDAY);
    }
    if(json.thursday) {
        dayStr.push(THURSDAY);
    }
    if(json.friday) {
        dayStr.push(FRIDAY);
    }
    if(json.saturday) {
        dayStr.push(SATURDAY);
    }
    if(json.sunday) {
        dayStr.push(SUNDAY);
    }

    return dayStr;
}

//추후에 classdb로 db.query는 분리해야함
router.get("/", isAdminAuthenticated, function(req, res) {
    let classArray = [];
    db.query("USE classdb");
    db.query("SELECT * FROM class", function(err, classes){
        if(err) {
            console.log("failed to find classes from db");
        }
        classes.forEach(aClass => {
            let newClass = [];
            newClass.id = aClass.id;
            newClass.name = aClass.name;
            newClass.classDay = getDayStr(aClass.class_day);
            classArray.push(newClass);
        });

        // console.log(classArray);
        //TODO: 고치기
        res.render("classList/classes", {classes : classArray, user: req.user});
    });
});

router.get("/class", isAdminAuthenticated, function(req, res) {
    getClassId(req.query.className).then(classId => res.redirect(`/classList/${classId}`));
})

router.get("/add", isAdminAuthenticated, function(req, res) {
    res.render("classList/add-class", {user: req.user});
});

router.post("/add-class", isAdminAuthenticated, function(req, res) {
    //TODO: 아래를 req바디를 나누고 db에 보내느게 좋을듯
    const dayStr = trnasferJsonToDayStr(req.body);
    addClassToDB(req.body.classname, dayStr);
    res.redirect("/classList");
});

//TODO: 이 아래는 클래스를 따로 빼야함

router.get("/:id", isAdminAuthenticated, function(req, res) {
    getStudentAndExamInfos(req.params.id).then(infos => res.render("admin-class/class",
    {id: req.params.id, studentList: infos.studentList, examList: infos.examList, user: req.user}));
});

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

router.get("/:id/student", isAdminAuthenticated, function(req, res) {
    getStudentInfosByName(req.query.name, req.params.id).then(examList => {
        console.log(examList);
        res.render("admin-class/student", {examList : examList, studentName : req.query.name, user: req.user});
    });
});

router.get("/:id/exam", isAdminAuthenticated, function(req, res) {
    getCommonExamRound(req.query.round, req.params.id).then(commonRound => {
        getExamInfosById(req.query.round, req.params.id, req.user).then(studentList => res.render("admin-class/exam", 
        {studentList : studentList, round : req.query.round, commonRound : commonRound, user: req.user}));
    });
});

router.get("/:id/delete", isAdminAuthenticated, function(req, res) {
    deleteClassFromDB(req.params.id);
    res.redirect("/classList");
});

export default router;