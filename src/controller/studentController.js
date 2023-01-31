import express from "express";
import { isAuthenticated } from "../auth/authMiddleware.js";

import wrap from 'express-async-wrap'
import StudentService from "../domain/service/studentService.js";
import ExamService from "../domain/service/examService.js";
import TotalExamService from "../domain/service/totalExamService.js";
import container from "../container.js";

const router = express.Router();

const studentService = container.resolve('studentService');
const examService = container.resolve('examService');
const totalExamService = container.resolve('totalExamService');

export default (app) => {
    app.use('/class', router);

    router.get("/", isAuthenticated, wrap(async function(req, res) {
        //username 가져오기, 시험 리스트 가져오기
        const student = await studentService.getStudentByPhoneNNum(req.user.username);
        const studentExams = await examService.getStudentExams(student.id, student.classId);

        res.render("class/exam-list", {studentName : req.user.studentName, studentExams: studentExams});
    }));

    router.get("/exam", isAuthenticated, wrap(async function(req, res) {
        const student = await studentService.getStudentByPhoneNNum(req.user.username);
        const studentExam = await examService.getStudentExam(student.id, req.query.round, student.classId);
        const seoulDeptInfo = await examService.getSeoulDeptInfo(studentExam.commonRound, student.id, studentExam.seoulDept);
        const yonseiDeptInfo = await examService.getYonseiDeptInfo(studentExam.commonRound, student.id, studentExam.yonseiDept);

        res.render("class/exam-info", {username: student.name, studentExam: studentExam,
                                        seoulDeptInfo: seoulDeptInfo, yonseiDeptInfo: yonseiDeptInfo});

    }));

    router.get("/score-rule", isAuthenticated, wrap(async function(req, res) {
        const round = req.query.round;
        const student = await studentService.getStudentByPhoneNNum(req.user.username);
        const scoreRules = await totalExamService.getScoreRules(round, student.classId);
        
        res.render("class/score-rule", {scoreRuleArr : scoreRules, round: round});
    }));

    router.get("/exam/problem-info", isAuthenticated, wrap(async function(req, res) {
        const student = await studentService.getStudentByPhoneNNum(req.user.username);
        const courseId = student.classId;
        const round = req.query.round;
        
        const studentExam = await examService.getStudentExam(student.id, round, courseId);
        const problemScores = await totalExamService.getProblemScores(round, courseId);

        res.render("class/problem-info", {studentExam: studentExam, problemScores: problemScores});
    }));
}


// export default router;