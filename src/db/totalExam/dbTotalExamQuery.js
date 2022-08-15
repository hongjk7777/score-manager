import db from "../dbConfig.js";

async function putTotalExamToDB(examInfo, problemScoreArr, scoreRule, classId) {
    //TODO:
    db.query("USE classdb");
    await deleteExistedTotalExam(examInfo.round, classId);
    await insertTotalExam(examInfo,  problemScoreArr, scoreRule, classId);
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

function insertTotalExam(examInfo, problemScoreArr, scoreRule, classId) {
    //TODO: 실제로 돌려서 이거 제대로 들어갔는지 확인하기
    // console.log(problemScoreArr);
    return new Promise(resolve => {
        db.query(`USE classdb`);
        db.query(`INSERT INTO total_exams(round, common_round, score_rule, class_id
                , total_tester, average, standard_deviation, max_score, first_problem_score, 
                    second_problem_score, third_problem_score) VALUES(${examInfo.round}, 
                    ${examInfo.commonRound}, '${scoreRule}', ${classId}, ${examInfo.totalTester},
                    ${examInfo.average}, ${examInfo.standardDeviation}, ${examInfo.maxScore},
                    ${problemScoreArr[0]}, ${problemScoreArr[1]}, ${problemScoreArr[2]})`, function(err){
            if(err){
                console.log(err);
            }
        });
        resolve();
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

export {putTotalExamToDB, getCommonExamRound, getProblemInfoByRound, getScoreRule, getMaxRound}