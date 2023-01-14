import db from "./dbConfig.js";
import { getStudentList, getStudentInfosById, getClassIdByStudent, getStudentIdByPNum } from "./student/dbStudentQuery";
import { getExamList } from "./exam/dbExamQuery.js";
import { getSeoulDeptInfo, getYonseiDeptInfo } from "./student/dbStudentDeptQuery";
import { getMaxRound } from "./totalExam/dbTotalExamQuery";

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

            totalInfo.commonRanking = getCommonRanking(rows, studentId);
            totalInfo.commonTester = rows.length;
            totalInfo.commonPercent = ((totalInfo.commonRanking/totalInfo.commonTester)*100).toFixed(1);
            totalInfo.maxScore = getMaxScore(rows);
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

function getMaxScore(rows) {
    if(rows.length > 0) {
        return rows[0].score_sum;
    } else {
        return 0;
    }
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
            exam.maxScore = totalInfo.maxScore;
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
                const yonseiDeptInfo = await getYonseiDeptInfo(id, exam.commonRound, exam.yonseiDept);
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
                exam.maxScore = examInfo.maxScore;

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
                    const yonseiDeptInfo = await getYonseiDeptInfo(id, exam.commonRound, exam.yonseiDept);
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


export {getStudentAndExamInfos, getSeoulDeptInfo, getYonseiDeptInfo}
export {getStudentInfosByPNum, getStudentInfoByPNum}