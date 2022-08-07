import express from "express";
import {isAuthenticated} from "../auth/auth.js";
import {getExamInfosById, getStudentNameByPNum, getStudentInfosByPNum, 
        getScoreRule, getStudentInfoByPNum, getExamChartDataById} from "../db/dbQuery.js";

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
            // getExamInfosById(req.query.round, userInfo.classId, userInfo).then(studentList => {
            //     res.render("class/exam-info", {username : userInfo.username , round : req.query.round, 
            //         studentList : studentList, studentInfo: studentInfo, userInfo : userInfo, user: req.user});
            // });
        });
        
    });
});

router.get("/score-rule", isAuthenticated, function(req, res) {
    getStudentNameByPNum(req.user.username).then(userInfo => {
        getScoreRule(req.query.round, userInfo.classId).then(scoreRule => {
            // console.log(scoreRule);
            const scoreRuleArr = scoreRule.split(/\r\n|\r|\n/);
            res.render("class/score-rule", {scoreRuleArr : scoreRuleArr, user: req.user});
        });
    });
});


export default router;