import db from "./dbConfig.js";
import {signUpByStudentPhoneNum, isAdmin} from "../auth/auth.js"
import { resolve } from "path";
import { log } from "console";
import { async } from "regenerator-runtime";

async function putTotalExamToDB(examInfo, scoreRule, classId) {
    //TODO:
    db.query("USE classdb");
    await deleteExistedTotalExam(examInfo.round, classId);
    await insertTotalExam(examInfo, scoreRule, classId);
}

function deleteExistedTotalExam(round, classId) {
    return new Promise(resolve => {
        db.query(`USE classdb`);
        db.query(`SELECT ID FROM total_exams WHERE round = ${round} AND class_id = ${classId}`, function(err, row) {
            if(err) {
                console.log("Failed to get total_exams");
                resolve();
            }
            // console.log(row);
            // console.log(row.length);

            if(row.length > 0) {
                db.query(`DELETE FROM total_exams WHERE round = ${round} AND class_id = ${classId}`, function(err) {
                    if(err) {
                        console.log(err);
                    }
                    resolve();
                });
            } else{
                resolve();
            }
        });
    })
}

function insertTotalExam(examInfo, scoreRule, classId) {
    return new Promise(resolve => {
        db.query(`USE classdb`);
        db.query(`INSERT INTO total_exams(round, common_round, score_rule, class_id
                , total_tester, average, standard_deviation, max_score) VALUES(${examInfo.round}, 
                    ${examInfo.commonRound}, '${scoreRule}', ${classId}, ${examInfo.totalTester},
                    ${examInfo.average}, ${examInfo.standardDeviation}, ${examInfo.maxScore})`, function(err){
            if(err){
                console.log(err);
            }
        });
        resolve();
    });     
}

function putScoreToDB(studentId, classId, round , commonRound, firstScore, secondScore, thirdScore, scoreSum, ranking) {
    return new Promise(resolve => {
        db.query(`USE classdb`);
        db.query(`SELECT id FROM exams WHERE student_id = '${studentId}' AND round = '${round}'`, function(err, row) {
            if(err){
                console.log(err);
                resolve();
            }

            console.log(row.length);

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


//FIXME: 이거 없애야 함 똑같은 이름을 가진 학생이 잇을수도
function getStudentIdByName(studentName, classId, studentPhoneNum) {
    return new Promise(resolve =>  {
        db.query("USE classdb");
        db.query(`SELECT id FROM students WHERE name = '${studentName}' AND class_id = ${classId}`, function(err, row) {
            if(err) {
                console.log("Failed to get student ID");
                resolve(-1);
            }
    
            if(row.length > 0) {
                resolve(row[0].id);
            } else {
                console.log("Failed to get student ID");
                resolve(-1);
            }
        });
    });
}

function getStudentIdByPNum(studentPhoneNum, classId) {
    return new Promise(resolve =>  {
        db.query("USE classdb");
        db.query(`SELECT id FROM students WHERE phone_num = '${studentPhoneNum}'`, function(err, row) {
            if(err) {
                console.log("Failed to get student ID with phone number");
                console.log(err);
                resolve(-1);
            }
    
            if(row.length > 0) {
                resolve(row[0].id);
            } else {
                console.log("Failed to get student ID with phone number");
                resolve(-1);
            }
        });
    });
}

function getStudentNameByPNum(studentPhoneNum) {
    return new Promise(resolve =>  {
        db.query("USE classdb");
        db.query(`SELECT name, class_id, id FROM students WHERE phone_num = '${studentPhoneNum}'`, function(err, row) {
            let userInfo = [];
            if(err) {
                console.log("Failed to get student name with phone number");
                console.log(err);
                resolve(userInfo);
            }
            console.log(row);
            if(row.length > 0) {
                userInfo.username = row[0].name;
                userInfo.classId = row[0].class_id;
                userInfo.id = row[0].id;
                resolve(userInfo);
            } else {
                console.log("Failed to get student name with phone number.");
                resolve(userInfo);
            }
        });
    });
}

// function getStudentNameById(studentId) {
//     return new Promise(resolve =>  {
//         db.query("USE classdb");
//         db.query(`SELECT name FROM students WHERE id = '${studentId}'`, function(err, row) {
//             if(err) {
//                 console.log("Failed to get student Name");
//                 resolve("");
//             }
    
//             if(row.length === 0) {
//                 console.log("can not find student has such name");
//                 resolve("");
//             } else {
//                 resolve(row[0].name);
//             }
//         });
//     });
// }

//TODO: 핸드폰 번호 중복 시 처리도 넣자
function removeSamePNumStudent(studentName, studentPhoneNum, classId, schoolName, studentId) {
    return new Promise(resolve => {
        getStudentIdByPNum(studentPhoneNum).then(studentId => {
            // console.log(studentId);
            db.query("USE classdb");
                db.query(`DELETE FROM exams WHERE student_id = ${studentId}`, function(err) {
                    if(err) {
                        console.log(err);
                        resolve();
                    }

                    console.log(studentName);
                    // console.log("success");
                    // resolve();
                    db.query(`DELETE FROM students WHERE id = ${studentId}`, function (err) {
                        if(err){
                            console.log(err);
                            resolve();
                        } 
                        resolve();
                    });
                });
        });
        
    });
}

function addStudentToDB(studentName, studentPhoneNum, classId, schoolName) {
    return new Promise(resolve => {
        db.query("USE classdb");
        
        db.query(`INSERT INTO students(name, phone_num, class_id, school) 
            values ('${studentName}', '${studentPhoneNum}', '${classId}', '${schoolName}')`, function(err, row) {
                if(err) {
                    console.log(err);                        
                }
                signUpByStudentPhoneNum(studentPhoneNum);
                resolve();
        });
    });
    
}


async function getStudentAndExamInfos(classId) {
    let infos = [];
    const studentList = await getStudentList(classId);
    const examList = await getExamList(classId);

    infos.studentList = studentList;
    infos.examList = examList;

    // console.log(infos);
    return new Promise(resolve => {
        resolve(infos);
    })
}

function getStudentList(classId) {
    return new Promise(resolve => {
        db.query(`USE classdb`);
        db.query(`SELECT id, name FROM students WHERE class_id = ${classId}`, function(err, rows) {
            let studentList = [];

            if(err) {
                console.log("Failed to load student list");
                resolve(studentList);
            }

            rows.forEach(row => {
                let student = [];
                student.id = row.id;
                student.name = row.name; 
                studentList.push(student);
            });
            // console.log(studentList);
            resolve(studentList);
        });
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

function getClassId(className) {
    return new Promise(resolve => {
        db.query(`USE classdb`);
        db.query(`SELECT id FROM classes WHERE name = '${className}'`, function(err, aClass) {
            if(err) {
                console.log("Failed to load class id with class name");
                console.log(err);
                resolve(0);
            } else{
                resolve(aClass[0].id);
            }
        })
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

function getTotalExamInfoById(id) {
    return new Promise(resolve => {
        db.query(`USE classdb`);
        db.query(`SELECT round, class_id FROM total_exams WHERE id = '${id}'`, function(err, row) {
            let totalExamInfo = [];
            if(err) {
                console.log(err);
                resolve(totalExamInfo);
            }

            if(row.length > 0) {
                totalExamInfo.round = row[0].round;
                totalExamInfo.classId = row[0].class_id;
            }
            resolve(totalExamInfo);

        });
    });
}

async function getStudentInfosById(id) {
    return new Promise(resolve => {
        db.query(`USE classdb`);
        db.query(`SELECT exams.round, exams.common_round, first_score, second_score, third_score, score_sum, ranking, students.school,
                seoul_dept, yonsei_dept, total_exams.average, total_exams.standard_deviation, total_exams.total_tester, max_score
                FROM exams INNER JOIN total_exams ON exams.round = total_exams.round AND exams.class_id = total_exams.class_id 
                INNER JOIN students ON students.id = exams.student_id WHERE student_id = ${id}`, function (err, exams) {
            let examList = [];
            if(err) {
                console.log("Failed to load student datas");
                console.log(err);
                resolve(examList);
            }
            else{
                exams.forEach(async function(exam) {
                    let newExam = [];

                    newExam.round = exam.round;
                    newExam.firstScore = exam.first_score;
                    newExam.secondScore = exam.second_score;
                    newExam.thirdScore = exam.third_score;
                    newExam.scoreSum = exam.score_sum;
                    newExam.ranking = exam.ranking;
                    newExam.commonRound = exam.common_round;
                    newExam.maxScore = exam.max_score;

                    if(exam.seoul_dept) {
                        newExam.seoulDept = exam.seoul_dept;
                    }
                    if(exam.yonsei_dept) {
                        newExam.yonseiDept = exam.yonsei_dept;
                    }
                    if(exam.school) {
                        newExam.school = exam.school;
                    }
                    newExam.totalTester = exam.total_tester;
                    newExam.percent = ((exam.ranking / exam.total_tester) * 100).toFixed(0);
                    newExam.average = exam.average;
                    newExam.standardDeviation = exam.standard_deviation;
                    examList.push(newExam);
                });
                // console.log(examList);
                resolve(examList);
            }

            
        });
    });
}

async function getProblemInfoByRound(round, classId) {

    const commonRound = getCommonExamRound(round, classId);

    let problemInfo;

    if(commonRound > 0){
        problemInfo = await getCommonProblemInfo(commonRound);
    } else {
        problemInfo = await getProblemInfo(round, classId);
    }

    return new Promise(resolve => {
        resolve(problemInfo);
    });
}

function getCommonProblemInfo(commonRound) {
    return new Promise(resolve => {
        db.query(`SELECT first_score, second_score, third_score FROM exams WHERE common_round = ${commonRound}`, function(err, rows){
            let problemInfo = [];

            let firstScoreSum = 0;
            let secondScoreSum = 0;
            let thirdScoreSum = 0;

            if(err){
                console.log(err);
                resolve(problemInfo);
            }

            if(rows.length > 0){

                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    firstScoreSum += row.first_score;
                    secondScoreSum += row.second_score;
                    thirdScoreSum += row.third_score;
                }

                problemInfo.firstScoreAverage = (firstScoreSum / rows.length).toFixed(2);
                problemInfo.secondScoreAverage = (secondScoreSum / rows.length).toFixed(2);
                problemInfo.thirdScoreAverage = (thirdScoreSum / rows.length).toFixed(2);
            } else {
                problemInfo.firstScoreAverage = 0;
                problemInfo.secondScoreAverage = 0;
                problemInfo.thirdScoreAverage = 0;
            }
            
            resolve(problemInfo);
        });
    });
}

function getProblemInfo(round, classId) {
    return new Promise(resolve => {
        db.query(`SELECT first_score, second_score, third_score FROM exams WHERE round = ${round} AND class_id = ${classId}`, function(err, rows){
            let problemInfo = [];

            let firstScoreSum = 0;
            let secondScoreSum = 0;
            let thirdScoreSum = 0;

            if(err){
                console.log(err);
                resolve(problemInfo);
            }

            if(rows?.length > 0){

                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    firstScoreSum += row.first_score;
                    secondScoreSum += row.second_score;
                    thirdScoreSum += row.third_score;
                }

                problemInfo.firstScoreAverage = (firstScoreSum / rows.length).toFixed(2);
                problemInfo.secondScoreAverage = (secondScoreSum / rows.length).toFixed(2);
                problemInfo.thirdScoreAverage = (thirdScoreSum / rows.length).toFixed(2);
            } else {
                problemInfo.firstScoreAverage = 0;
                problemInfo.secondScoreAverage = 0;
                problemInfo.thirdScoreAverage = 0;
            }
            
            resolve(problemInfo);
        });
    });
}
// async function addTotalRankingToList(phoneNum, examList) {
//     const id = await getStudentIdByPNum(phoneNum);

//     examList.forEach(async function (exam) {
//         console.log(exam.comm);
//         if(exam.commonRound > 0){
//             console.log("하하");
//             exam.commonRanking = await getTotalRanking(id, exam.commonRound);
//         }
//     });

//     return new Promise(resolve => resolve(examList));
//}

function getTotalInfo(studentId, commonRound) {
    return new Promise(resolve => {
        db.query("USE classdb");
        db.query(`SELECT score_sum, student_id FROM exams WHERE 
                common_round = ${commonRound} ORDER BY score_sum DESC`, function(err, rows) {
            let totalInfo = [];
            if(err) {
                console.log(err);
                resolve(totalInfo);
            }

            // let ranking = 1;
            // let lastScore = -1;
            // let sameCount = 0;
            // rows.forEach(row => {
            //     if(row.score_sum === lastScore){
            //         sameCount++;
            //     } else{
            //         sameCount = 0;
            //     }

            //     if(row.student_id === studentId) {
            //         console.log(ranking - sameCount);
            //         resolve(ranking - sameCount);
            //     }
            //     ranking++;
            //     lastScore = row.score_sum;
            // });
            // resolve(0);
            totalInfo.commonRanking = getCommonRanking(rows, studentId);
            totalInfo.commonTester = rows.length;
            totalInfo.commonPercent = ((totalInfo.commonRanking/totalInfo.commonTester)*100).toFixed(1);
            rows = rows.map(x => {
                if(x.score_sum > 0){
                    return x.score_sum;
                }
            });
            totalInfo.commonAverage = (rows.reduce((a, b) => a + b) / rows.length).toFixed(2);
            totalInfo.commonStandardDev = (Math.sqrt(rows.map(x => Math.pow(x - totalInfo.commonAverage, 2)).reduce((a, b) => a + b) / rows.length)).toFixed(2);
            // console.log(totalInfo);
            resolve(totalInfo);
        });
    });
}

function getCommonRanking(rows, studentId) {
    let ranking = 1;
    let lastScore = -1;
    let sameCount = 0;
    let commonRanking = 0;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if(row.score_sum === lastScore){
            sameCount++;
        } else{
            sameCount = 0;
        }

        if(row.student_id === studentId) {
            commonRanking = ranking - sameCount;
            return commonRanking;
        }

        ranking++;
        lastScore = row.score_sum;
    }
    console.log(commonRanking);
    return commonRanking;
}

function getSeoulDeptInfo(studentId, commonRound, seoulDept) {
    return new Promise(resolve => {
        db.query("USE classdb");
        db.query(`SELECT score_sum, student_id FROM exams WHERE common_round = ${commonRound} 
                AND seoul_dept = '${seoulDept}' ORDER BY score_sum DESC`, function(err, rows) {

            let seoulDeptInfo = [];

            if(err) {
                console.log(err);
                resolve(seoulDeptInfo);
            }

            seoulDeptInfo.seoulDeptTester = rows.length;
            
            //TODO: 아래 두개를 합치는 게 더 빠를 듯
            seoulDeptInfo.seoulChartData = getChartData(rows);
            seoulDeptInfo.seoulDeptRanking = getDeptRanking(rows, studentId);
            seoulDeptInfo.seoulDeptAverage = getDeptAverage(rows);
            seoulDeptInfo.seoulDeptMaxScore = getDeptMaxScore(rows);
            resolve(seoulDeptInfo);
        });
    });
}

function getYonseiDeptRanking(studentId, commonRound, yonseiDept) { 
    return new Promise(resolve => {
        db.query("USE classdb");
        db.query(`SELECT score_sum, student_id FROM exams WHERE common_round = ${commonRound} 
                AND yonsei_dept = '${yonseiDept}' ORDER BY score_sum DESC`, function(err, rows) {
            let yonseiDeptInfo = [];
            if(err) {
                console.log(err);
                resolve(yonseiDeptInfo);
            }
            yonseiDeptInfo.yonseiDeptTester = rows.length;

            yonseiDeptInfo.yonseiChartData = getChartData(rows);
            yonseiDeptInfo.yonseiDeptRanking = getDeptRanking(rows, studentId);
            yonseiDeptInfo.yonseiDeptAverage = getDeptAverage(rows);
            yonseiDeptInfo.yonseiDeptMaxScore = getDeptMaxScore(rows);
            resolve(yonseiDeptInfo);
        });
    });
}

function getChartData(rows){
    let chartData = new Array(10).fill(0);

    rows.forEach(row => {
        const scoreSum = row.score_sum;
        if(scoreSum != 0) {
            chartData[Math.ceil(scoreSum / 5) - 1]++;
        } else {
            chartData[0]++;
        }
    });

    return chartData;
}

//TODO: getcommonranking이랑 조인을 활용하면 함수를 하나로 합칠 수 잇음
function getDeptRanking(rows, studentId) {
    let ranking = 1;
    let lastScore = -1;
    let sameCount = 0;
    let deptRanking = 0;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if(row.score_sum === lastScore){
            sameCount++;
        } else{
            sameCount = 0;
        }

        if(row.student_id === studentId) {
            deptRanking = ranking - sameCount;
            return deptRanking;
        }

        ranking++;
        lastScore = row.score_sum;
    }
    return deptRanking;
}

function getDeptAverage(rows) {
    let sum = 0;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        sum += row.score_sum;
    }

    if(rows.length > 0) {
        return (sum / rows.length).toFixed(2);
    } else {
        return " ";
    }
}

function getDeptMaxScore(rows) {
    let maxScore = 0;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        maxScore = Math.max(maxScore, row.score_sum);
    }

    return maxScore;
}

async function getStudentInfosByName(name, classId) {
    //FIXME: 이거 이름으로 하면 안될지도
    const id = await getStudentIdByName(name, classId);
    let examList = await getStudentInfosById(id);
    let ret = [];

    for (let i = 0; i < examList.length; i++) {
        const exam = examList[i];
        if(exam.commonRound > 0){
            const totalInfo = await getTotalInfo(id, exam.commonRound);
            exam.commonRanking = totalInfo.commonRanking;        
            exam.commonAverage = totalInfo.commonAverage;
            exam.commonTester = totalInfo.commonTester;
            exam.commonPercent = totalInfo.commonPercent;
            exam.commonStandardDev = totalInfo.commonStandardDev;
            if(exam.seoulDept){
                exam.seoulDeptRanking = await getSeoulDeptInfo(id, exam.commonRound, exam.seoulDept).seoulDeptRanking;
            }

            if(exam.yonseiDept){
                exam.yonseiDeptRanking = await getYonseiDeptRanking(id, exam.commonRound, exam.yonseiDept).yonseiDeptRanking;
            }
        }
    }
    return new Promise(resolve => resolve(examList));
}

async function getStudentInfosByPNum(studentPhoneNum) {
    const id = await getStudentIdByPNum(studentPhoneNum);
    const classId = await getClassIdByStudent(studentPhoneNum);
    let examList = await getStudentInfosById(id);
    const maxRound = await getMaxRound(classId);
    console.log(maxRound);
    let ret = new Array(maxRound).fill(null);

    for (let i = 0; i < examList.length; i++) {
        const exam = examList[i];
        exam.solve = true;
        if(exam.commonRound > 0){
            const totalInfo = await getTotalInfo(id, exam.commonRound);
            exam.commonRanking = totalInfo.commonRanking;
            exam.commonTester = totalInfo.commonTester;
            exam.commonPercent = totalInfo.commonPercent;   
            exam.commonAverage = totalInfo.commonAverage;
            // if(exam.commonAverage){
            //     exam.commonAverage = exam.commonAverage.toFixed(2);
            // }
            exam.commonStandardDev = totalInfo.commonStandardDev;     
            // if(exam.commonStandardDev){
            //     exam.commonStandardDev = exam.commonStandardDev.toFixed(2);
            // }
            if(exam.seoulDept){
                const seoulDeptInfo = await getSeoulDeptInfo(id, exam.commonRound, exam.seoulDept);
                exam.seoulDeptRanking = seoulDeptInfo.seoulDeptRanking;
            }

            if(exam.yonseiDept){
                const yonseiDeptInfo = await getYonseiDeptRanking(id, exam.commonRound, exam.yonseiDept);
                // console.log(yonseiDeptInfo);
                exam.yonseiDeptRanking = yonseiDeptInfo.yonseiDeptRanking;
            }
        }
        ret[exam.round - 1] = exam;
    }
    return new Promise(resolve => resolve(ret));
}

async function getStudentInfoByPNum(studentPhoneNum, round) {
    const id = await getStudentIdByPNum(studentPhoneNum);
    let examList = await getStudentInfosById(id);
    let studentInfo;

    for (let i = 0; i < examList.length; i++) {
        const exam = examList[i];
        if(exam.round === parseInt(round)){
            console.log("Come in");
            if(exam.commonRound > 0){
                const examInfo = await getTotalInfo(id, exam.commonRound);
                // console.log(examInfo);
                exam.commonAverage = examInfo.commonAverage;
                // if(exam.commonAverage){
                //     exam.commonAverage = exam.commonAverage.toFixed(2);
                // }
                exam.commonStandardDev = examInfo.commonStandardDev;
                // if(exam.commonStandardDev){
                //     exam.commonStandardDev = exam.commonStandardDev.toFixed(2);
                // }
                exam.commonRanking = examInfo.commonRanking;
                exam.commonTester = examInfo.commonTester;
                exam.commonPercent = examInfo.commonPercent;
                // console.log(exam);

                if(exam.seoulDept){
                    const seoulDeptInfo = await getSeoulDeptInfo(id, exam.commonRound, exam.seoulDept);
                    exam.seoulChartData = seoulDeptInfo.seoulChartData;
                    exam.seoulDeptRanking = seoulDeptInfo.seoulDeptRanking;
                    exam.seoulDeptTester = seoulDeptInfo.seoulDeptTester;
                    exam.seoulDeptAverage = seoulDeptInfo.seoulDeptAverage;
                    exam.seoulDeptMaxScore = seoulDeptInfo.seoulDeptMaxScore;
                }
    
                if(exam.yonseiDept){
                    const yonseiDeptInfo = await getYonseiDeptRanking(id, exam.commonRound, exam.yonseiDept);
                    exam.yonseiChartData = yonseiDeptInfo.yonseiChartData;
                    exam.yonseiDeptRanking = yonseiDeptInfo.yonseiDeptRanking;
                    exam.yonseiDeptTester = yonseiDeptInfo.yonseiDeptTester;
                    exam.yonseiDeptAverage = yonseiDeptInfo.yonseiDeptAverage;
                    exam.yonseiDeptMaxScore = yonseiDeptInfo.yonseiDeptMaxScore;
                }
            }
            studentInfo = exam;
        }
    }
    return new Promise(resolve => resolve(studentInfo));
}


function getClassIdByStudent(studentPhoneNum){
    return new Promise(resolve => {
        db.query(`SELECT class_id FROM students WHERE phone_num = '${studentPhoneNum}'`, function(err, row) {
            if(err) {
                console.log(err);
                resolve(0);
            }

            if(row?.length > 0) {
                resolve(row[0].class_id);
            } else{
                resolve(0);
            }
        });
    });
}

function getMaxRound(classId){
    return new Promise(resolve => {
        db.query(`SELECT round FROM total_exams WHERE class_id = ${classId} ORDER BY round DESC`, function(err, row) {
            if(err) {
                console.log(err);
                resolve(0);
            }

            if(row?.length > 0) {
                resolve(row[0].round);
            } else{
                resolve(0);
            }
        });
    });
}

function addClassToDB(className, dayStr) {
    db.query("USE classdb");
    db.query(`INSERT INTO classes(name, class_day) VALUES('${className}', '${dayStr}')`);
}

function deleteClassFromDB(classId) {
    return new Promise(resolve => {
        db.query("USE classdb");
//     delete from exams where class_id = 5;
// delete from students where class_id = 5;
// delete from total_exams where class_id = 5;
// delete from classes where id = 5;
        db.query(`DELETE FROM exams WHERE class_id = ${classId}`, function(err) {
            if(err) {
                console.log(err);
                resolve();
            }
            db.query(`DELETE FROM students WHERE class_id = ${classId}`, function(err) {
                if(err) {
                    console.log(err);
                    resolve();
                }
                db.query(`DELETE FROM total_exams WHERE class_id = ${classId}`, function(err) {
                    if(err) {
                        console.log(err);
                        resolve();
                    }
                    db.query(`DELETE FROM classes WHERE id = ${classId}`, function(err) {
                        if(err) {
                            console.log(err);
                            resolve();
                        }

                        resolve();
                    });
                });
            });
        });
    });
    
}

function getScoreRule(round, classId) {
    return new Promise(resolve => {
        db.query("USE classdb");
        db.query(`SELECT score_rule FROM total_exams WHERE round = ${round} AND class_id = ${classId}`, function(err, row) {
            if(err){
                console.log(err);
                resolve("");
            }
            
            if(row?.length > 0) {
                resolve(row[0].score_rule);
            } else {
                resolve("");
            }
        });
    }); 
}

function getCommonExamRound(round, classId) {
    return new Promise(resolve => {
        db.query("USE classdb");
        // console.log(round + classId);
        db.query(`SELECT common_round FROM total_exams WHERE round = ${round} AND class_id = ${classId}`, function(err, row) {
            if(err) {
                console.log(err);
                resolve(0);
            }
            // console.log(row);
            if(row?.length > 0) {
                resolve(row[0].common_round);
            } else {
                resolve(0);
            }
        });
    });
}

// function getUserInfoByName(username, classId) {
//     return new Promise(resolve =>  {
//         db.query("USE classdb");
//         db.query(`SELECT wanted_department FROM students 
//                 WHERE name = '${username}' AND class_id = ${classId}`, function(err, row) {
//             let userInfo = [];
//             if(err) {
//                 console.log("Failed to get student name with phone number");
//                 console.log(err);
//                 resolve(userInfo);
//             }
    
//             if(row.length > 0) {
//                 userInfo.dept = row[0].wanted_department;
//                 resolve(userInfo);
//             } else {
//                 console.log("Failed to get student name with phone number");
//                 resolve(userInfo);
//             }
//         });
//     });
// }

// function addDeptToDB(seoulDept, yonseiDept, studentId, commonRound) {
//     return new Promise(resolve =>  {
//         db.query("USE classdb");
//         db.query(`UPDATE exams SET seoul_dept = '${seoulDept}', yonsei_dept = '${yonseiDept}'
//                 WHERE student_id = '${studentId}' AND common_round = ${commonRound}`, function(err, row) {
//             if(err) {
//                 console.log("Failed to get student name with phone number");
//                 console.log(err);
//             }

//             resolve();
//         });
//     });
// }

function addSeoulDeptToDB(seoulDept, studentId, commonRound) {
    return new Promise(resolve =>  {
        db.query("USE classdb");
        db.query(`UPDATE exams SET seoul_dept = '${seoulDept}'
                WHERE student_id = '${studentId}' AND common_round = ${commonRound}`, function(err, row) {
            if(err) {
                console.log("Failed to get student name with phone number");
                console.log(err);
            }

            resolve();
        });
    });
}

function addYonseiDeptToDB(yonseiDept, studentId, commonRound) {
    return new Promise(resolve =>  {
        db.query("USE classdb");
        db.query(`UPDATE exams SET yonsei_dept = '${yonseiDept}'
                WHERE student_id = '${studentId}' AND common_round = ${commonRound}`, function(err, row) {
            if(err) {
                console.log("Failed to get student name with phone number");
                console.log(err);
            }

            resolve();
        });
    });
}

function deleteClassDB(classId) {
    return new Promise(resolve => {
        db.query(`DELETE FROM exams WHERE class_id = ${classId}`, function(err) {
            if(err) {
                console.log(err);
                resolve(false);
            }
            db.query(`DELETE FROM total_exams WHERE class_id = ${classId}`, function(err) {
                if(err) {
                    console.log(err);
                    resolve(false);
                }
                
                db.query(`DELETE FROM students WHERE class_id = ${classId}`, function(err) {
                    if(err) {
                        console.log(err);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        });
    })
}

function getStudentPNumByName(studentName) {
    return new Promise(resolve => {
        db.query(`SELECT phone_num FROM students WHERE name = '${studentName}'`, function(err, row) {
            if(err) {
                console.log(err);
                resolve("");
            }
            console.log(row);
            if(row?.length > 0) {
                resolve(row[0].phone_num);
            } else {
                resolve("");
            }
        });
    });
}

export {putTotalExamToDB}
export {getStudentIdByName}
export {putScoreToDB, addSeoulDeptToDB, addYonseiDeptToDB}
export {getStudentAndExamInfos}
export {getClassId}
export {getStudentInfosByName, getStudentNameByPNum}
export {getExamInfosById, getProblemInfoByRound}
export {getStudentInfosByPNum, getStudentInfoByPNum, addClassToDB, deleteClassFromDB, 
        removeSamePNumStudent, addStudentToDB, getScoreRule, getCommonExamRound, deleteClassDB
        , getStudentPNumByName, getExamChartDataById}