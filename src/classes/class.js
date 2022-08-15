import express from "express";
import {isAuthenticated} from "../auth/auth.js";
import {getStudentInfosByPNum, getStudentInfoByPNum} from "../db/dbQuery.js";
import {getStudentNameByPNum} from '../db/student/dbStudentQuery.js'
import { getProblemInfoByRound, getScoreRule } from "../db/totalExam/dbTotalExamQuery.js";
import { getExamChartDataById } from "../db/exam/dbExamQuery";

const router = express.Router();

router.get("/", isAuthenticated, function(req, res) {
    getStudentNameByPNum(req.user.username).then(userInfo => {
        getStudentInfosByPNum(req.user.username).then(examList => {
            res.render("class/exam-list", {examList : examList, userInfo : userInfo, user: req.user});
        });    
    }); 
});

router.get("/exam", isAuthenticated, function(req, res) {
    getStudentNameByPNum(req.user.username).then(userInfo => {
        getStudentInfoByPNum(req.user.username, req.query.round).then(studentInfo => {
            getExamChartDataById(req.query.round, userInfo.classId, userInfo).then(chartData => {
                res.render("class/exam-info", {username : userInfo.username , round : req.query.round, 
                    chartData : chartData, studentInfo: studentInfo, userInfo : userInfo, user: req.user});
            });
        });
        
    });
});

router.get("/score-rule", isAuthenticated, function(req, res) {
    getStudentNameByPNum(req.user.username).then(userInfo => {
        getScoreRule(req.query.round, userInfo.classId).then(scoreRule => {
            // console.log(scoreRule);
            const scoreRuleArr = scoreRule.split(/\r\n|\r|\n/);
            res.render("class/score-rule", {scoreRuleArr : scoreRuleArr, user: req.user, round: req.query.round});
        });
    });
});

router.get("/exam/problem-info", isAuthenticated, function(req, res) {
    getStudentNameByPNum(req.user.username).then(userInfo => {
        getStudentInfoByPNum(req.user?.username, req.query.round).then(studentInfo => {
            getProblemInfoByRound(req.query.round, userInfo.classId).then(problemInfo => {
                res.render("class/problem-info", {studentInfo: studentInfo, problemInfo: problemInfo});
            });
        });
    });
    
});


export default router;