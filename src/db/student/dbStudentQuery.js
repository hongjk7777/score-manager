import db from "../dbConfig.js";
import { getCommonExamRound } from "../../db/totalExam/dbTotalExamQuery.js";
import AuthService from "../../auth/authService.js";

const authService = new AuthService();

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

function getStudentPNumByName(studentName, classId) {
    return new Promise(resolve => {
        db.query(`SELECT phone_num FROM students WHERE name = '${studentName}' AND class_id = ${classId}`, function(err, row) {
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

//TODO: await을 안해도 되려나?
function addStudentToDB(studentName, studentPhoneNum, classId, schoolName) {
    return new Promise(resolve => {
        db.query("USE classdb");
        
        db.query(`INSERT INTO students(name, phone_num, class_id, school) 
            values ('${studentName}', '${studentPhoneNum}', '${classId}', '${schoolName}')`, function(err, row) {
                if(err) {
                    console.log(err);                        
                }
                authService.signUpByPhoneNum(studentPhoneNum);
                resolve();
        });
    });
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

async function getStudentInfosById(id) {
    return new Promise(resolve => {
        db.query(`USE classdb`);
        db.query(`SELECT exams.round, exams.common_round, first_score, second_score, third_score, score_sum, ranking, students.school,
                seoul_dept, yonsei_dept, total_exams.average, total_exams.standard_deviation, total_exams.total_tester, total_exams.max_score,
                total_exams.first_problem_score, total_exams.second_problem_score, total_exams.third_problem_score
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
                    newExam.firstProblemScore = exam.first_problem_score;
                    newExam.secondProblemScore = exam.second_problem_score;
                    newExam.thirdProblemScore = exam.third_problem_score;

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

function getClassIdByStudent(studentPhoneNum){
    // getCommonExamRound(round, classId);
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

export {getStudentIdByPNum, getStudentIdByName, getStudentNameByPNum, getStudentPNumByName, 
    removeSamePNumStudent, addStudentToDB, getStudentList, getStudentInfosById, getClassIdByStudent}