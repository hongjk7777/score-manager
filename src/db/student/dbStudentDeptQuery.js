import db from "../dbConfig.js";

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

function getYonseiDeptInfo(studentId, commonRound, yonseiDept) { 
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

export {addSeoulDeptToDB, addYonseiDeptToDB, getSeoulDeptInfo, getYonseiDeptInfo}
