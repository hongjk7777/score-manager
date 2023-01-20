import { resolve } from "path";
import db from "../dbConfig.js";

function getCommontTestExcel(commonRound) {
    let datas = [];

    return new Promise(resolve => {
        getScoreDistributionData(commonRound).then(scoreDistributionData => {
            getScoreRuleData(commonRound).then(scoreRuleData => {
                getRankingData(commonRound).then(rankingData => {
                    datas.push(scoreDistributionData);
                    datas.push(scoreRuleData);
                    datas.push(rankingData);
                
                    // console.log(datas);
                
                    resolve(datas);
                });
            }); 
        });
    });
    
    
}

function getScoreDistributionData(commonRound) {
    return new Promise(resolve => {
        db.query(`SELECT score_sum FROM exams WHERE common_round = ${commonRound} ORDER BY score_sum DESC`, function(err, rows){
            let aoa = [];
            if(err) {
                console.log(err);
                resolve(aoa);
            } else {
                addRanking(rows);
                addDistribution(rows);

                rows.forEach(row => {
                    let arr = [];
                    arr.push(row.score_sum);
                    arr.push(row.ranking);
                    arr.push(row.distribution);
                    aoa.push(arr);
                });

                // console.log(rows);
                resolve(aoa);
            }
        });
    });
}

function getScoreRuleData(commonRound) {
    return new Promise(resolve => {
        db.query(`SELECT score_rule FROM total_exams WHERE common_round = ${commonRound}`, function(err, rows){
            // console.log(row[0]);
            let aoa = [];

            if(err) {
                console.log(err);
                resolve('');
            } else{
                if(rows.length === 0) {
                    resolve('');
                } else{
                    const scoreRule = rows[0].score_rule.replaceAll('$', '');
                    const scoreRuleArr = scoreRule.split(/\r\n|\r|\n/);

                    scoreRuleArr.forEach(element => {
                        aoa.push(new Array(element));
                    });

                    resolve(aoa);
                }
            }
            
        });
    });
}

function getRankingData(commonRound) {
    return new Promise(resolve => {
        db.query(`SELECT first_score, second_score, third_score, score_sum, seoul_dept, 
                yonsei_dept, students.name AS student_name, phone_num, classes.name AS class_name
                FROM exams INNER JOIN students ON exams.student_id = students.id INNER JOIN classes 
                ON students.class_id = classes.id WHERE common_round = ${commonRound} ORDER BY score_sum DESC`, 
                function(err, rows){

            let aoa = [];

            if(err) {
                console.log(err);
                resolve(aoa);
            } else {
                addRanking(rows);
                addNum(rows);

                rows.forEach(row => {
                    let arr = [];
                    arr.push(row.num);
                    arr.push(row.class_name);
                    arr.push(row.student_name);
                    arr.push(row.phone_num);
                    arr.push(row.first_score);
                    arr.push(row.second_score);
                    arr.push(row.third_score);
                    arr.push(row.score_sum);
                    arr.push(row.ranking);
                    arr.push(row.seoul_dept);
                    arr.push(row.yonsei_dept);
                    
                    aoa.push(arr);
                });
                // console.log(rows);
                resolve(aoa);
            }
        });
    });
}

function addRanking(rows){
    let ranking = 1;
    let lastScore = -1;
    let sameCount = 0;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if(row.score_sum === lastScore){
            sameCount++;
        } else{
            sameCount = 0;
        }

        row.ranking = i + 1 - sameCount;

        lastScore = row.score_sum;
    }
}

function addDistribution(rows){
    const totalPeople = rows.length;
    rows.forEach(row => {
        const ranking = row.ranking;
        const distribution = ((totalPeople - ranking) / totalPeople) * 100
        row.distribution = distribution.toFixed(1);
    });
}

function addNum(rows){
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        row.num = i + 1;
    }
}

export {getCommontTestExcel}