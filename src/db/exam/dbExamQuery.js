import db from "../dbConfig.js";
import { getCommonExamRound } from '../totalExam/dbTotalExamQuery.js';
import {isAdmin} from "../../auth/auth.js";
import { resolve } from "path";

function putScoreToDB(studentId, classId, round , commonRound, firstScore, secondScore, thirdScore, scoreSum, ranking) {
    return new Promise(resolve => {
        db.query(`USE classdb`);
        db.query(`SELECT id FROM exams WHERE student_id = '${studentId}' AND round = '${round}'`, function(err, row) {
            if(err){
                console.log(err);
                resolve();
            }

            // console.log(row.length);

            deleteExistedData(row).then(
                db.query(`INSERT INTO exams(round, common_round, first_score, second_score, third_score, score_sum, ranking, student_id, class_id) 
                        values('${round}', ${commonRound}, '${firstScore}', '${secondScore}', '${thirdScore}', '${scoreSum}', '${ranking}', '${studentId}', '${classId}')`,
                        function(err) {
                    if(err){
                        console.log(err);
                    }
                    resolve();
                })
            );
            
            
        });
        
    });
    
    // console.log(studentId + classId + round + firstScore + secondScore + thirdScore + scoreSum + ranking);
}

function deleteExistedData(row) {
    return new Promise(resolve => {
        if(row.length != 0) {
            db.query(`DELETE FROM exams WHERE id = '${row[0].id}'`, function (err, row) {
                if(err){
                    console.log(err);
                }
                resolve();
            });
        } else{
            resolve();
        }
    })
}

//TODO: exam id에 기반해서 해야될듯
function getExamList(classId) {
    db.query(`USE classdb`);
    return new Promise(resolve => {
        db.query(`SELECT id, round, common_round FROM total_exams WHERE class_id = ${classId}`, function(err, rows) {
            let examList = [];
            if(err) {
                console.log("Failed to load exam list");
                resolve(examList);
            }

            rows.forEach(row => {
                let exam = [];
                exam.id = row.id;
                exam.round = row.round;
                exam.commonRound = row.common_round;
                examList.push(exam);
            });

            resolve(examList);
        });
    })
}


async function getExamInfosById(round, classId, user) {
    // console.log(id);
    // const totalExamInfo = await getTotalExamInfoById(id);
    const commonRound = await getCommonExamRound(round, classId);
    if(commonRound === 0) {
        return new Promise(resolve => {
            db.query(`USE classdb`);
            db.query(`SELECT exams.first_score, exams.second_score, exams.third_score, students.school, 
                    exams.score_sum, exams.ranking, students.name, students.id FROM exams 
                    INNER JOIN students ON exams.student_id = students.id
                    WHERE round = ${round} AND exams.class_id = ${classId} ORDER BY score_sum DESC`, function (err, studentScores) {
                let studentList = [];
    
                if(err) {
                    console.log("Failed to load exam datas");
                    console.log(err);
                    resolve(studentList);
                } else{
                    let ranking = 1;
                    let sameCount = 0;
                    let lastScore = -1;

                    studentScores.forEach(studentScore => {
                        let studentInfo = [];
                        studentInfo.firstScore = studentScore.first_score;
                        studentInfo.secondScore = studentScore.second_score;
                        studentInfo.thirdScore = studentScore.third_score;
                        studentInfo.scoreSum = studentScore.score_sum;
                        // studentInfo.ranking = studentScore.ranking;
                        if(studentScore.school){
                            studentInfo.school = studentScore.school;
                        }

                        if(lastScore === studentScore.score_sum) sameCount++;
                        else sameCount = 0;
                        lastScore = studentScore.score_sum;

                        studentInfo.ranking = ranking++ - sameCount;

                        if(isAdmin(user) || user.id === studentScore.id) {
                            studentInfo.name = studentScore.name;
                        } else {
                            studentInfo.name = '***';
                        }
        
                        studentList.push(studentInfo);
                    });
                    
                    resolve(studentList);
                }
    
                
            });
        });
    } else {
        return new Promise(resolve => {
            db.query(`USE classdb`);
            db.query(`SELECT exams.first_score, exams.second_score, exams.third_score, students.school,
                    exams.score_sum, exams.ranking, exams.seoul_dept, yonsei_dept, 
                    students.name FROM exams INNER JOIN students ON exams.student_id = students.id
                    WHERE common_round = ${commonRound} ORDER BY score_sum DESC`, function (err, studentScores) {
                let studentList = [];
    
                if(err) {
                    console.log("Failed to load exam datas");
                    console.log(err);
                    resolve(studentList);
                } else{
                    //순위 산정을 위해 넣은 변수
                    let ranking = 1;
                    let sameCount = 0;
                    let lastScore = -1;

                    studentScores.forEach(studentScore => {
                        let studentInfo = [];
                        studentInfo.firstScore = studentScore.first_score;
                        studentInfo.secondScore = studentScore.second_score;
                        studentInfo.thirdScore = studentScore.third_score;
                        studentInfo.scoreSum = studentScore.score_sum;
                        if(studentScore.school){
                            studentInfo.school = studentScore.school;
                        }
                        if(studentScore.seoul_dept){
                            studentInfo.seoulDept = studentScore.seoul_dept;
                        }
                        if(studentScore.yonsei_dept){
                            studentInfo.yonseiDept = studentScore.yonsei_dept;
                        }

                        if(lastScore === studentScore.score_sum) sameCount++;
                        else sameCount = 0;
                        lastScore = studentScore.score_sum;

                        studentInfo.ranking = ranking++ - sameCount;

                        if(isAdmin(user) || user.username === studentScore.name) {
                            studentInfo.name = studentScore.name;
                        } else {
                            studentInfo.name = '***';
                        }
        
                        studentList.push(studentInfo);
                    });
                    
                    resolve(studentList);
                }
    
                
            });
        });
    }
}

async function getExamChartDataById(round, classId, user) {
    const commonRound = await getCommonExamRound(round, classId);
    if(commonRound === 0) {
        return new Promise(resolve => {
            db.query(`USE classdb`);
            db.query(`SELECT exams.score_sum FROM exams WHERE round = ${round} 
                    AND exams.class_id = ${classId}`, function (err, studentScores) {
                let chartData = new Array(10).fill(0);
    
                if(err) {
                    console.log("Failed to load exam datas");
                    console.log(err);
                    resolve(chartData);
                } else{
                    studentScores.forEach(studentScore => {
                        const scoreSum = studentScore.score_sum;
                        if(scoreSum != 0) {
                            chartData[Math.ceil(scoreSum / 5) - 1]++;
                        } else {
                            chartData[0]++;
                        }
                    });
                    
                    resolve(chartData);
                }
    
                
            });
        });
    } else {
        return new Promise(resolve => {
            db.query(`USE classdb`);
            db.query(`SELECT 
                    exams.score_sum FROM exams INNER JOIN students ON exams.student_id = students.id
                    WHERE common_round = ${commonRound}`, function (err, studentScores) {
                let chartData = new Array(10).fill(0);
    
                if(err) {
                    console.log("Failed to load exam datas");
                    console.log(err);
                    resolve(chartData);
                } else{
                    studentScores.forEach(studentScore => {
                        const scoreSum = studentScore.score_sum;
                        if(scoreSum != 0) {
                            chartData[Math.ceil(scoreSum / 5) - 1]++;
                        } else {
                            chartData[0]++;
                        }
                    });
                    
                    resolve(chartData);
                }
    
                
            });
        });
    }
}

function getCommonExamCount() {
    return new Promise(resolve => {
        db.query(`SELECT common_round FROM total_exams ORDER BY common_round DESC`, function(err, rows){
            if(err) {
                console.log(err);
            } else{
                if(rows.length > 0 && rows[0].common_round > 0){
                    resolve(rows[0].common_round);
                } else{
                    resolve(0);
                }
            }
        })
    });
}


export {putScoreToDB, getExamInfosById, getExamList, getExamChartDataById, getCommonExamCount}