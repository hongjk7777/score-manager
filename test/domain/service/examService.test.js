import { async } from "regenerator-runtime";
import ExamService from "../../../src/domain/service/examService";

const examService = new ExamService();

describe('getScoreDatas 테스트', () => {
    test.skip('정상 테스트', async () => {
        const commonRound = 2;
        const scoreDatas = await examService.getScoreDatas(commonRound);

        console.log(scoreDatas);

        scoreDatas.forEach((scoreData, index) => {
            const realDist = calcDistribution(scoreData, scoreDatas.length);

            expect(scoreData.distribution).toBe(realDist);

            if(index > 0) {
                const prevScoreData = scoreDatas[index - 1];

                if(prevScoreData.score_sum === scoreData.score_sum) {
                    expect(scoreData.ranking).toBe(prevScoreData.ranking);
                } else {
                    expect(scoreData.ranking).not.toBe(prevScoreData.ranking);
                }
            }
        })
    })
})

function calcDistribution(scoreData, totalTester) {
    return (((totalTester - scoreData.ranking) / totalTester) * 100).toFixed(1);
}

describe('getRankingData 테스트', () =>{
    test('정상 테스트', async () => {
        const commonRound = 2;

        const rankingData = await examService.getRankingDatas(commonRound);

        expect(rankingData.length).toBe(315);
    })
})

describe('getStudentExam 테스트', () =>{
    test('정상 테스트', async () => {
        const exams = await examService.getStudentExam(10222, 3, 14);

        console.log(exams);
    })
})