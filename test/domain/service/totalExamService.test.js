import { async } from "regenerator-runtime";
import TotalExamService from "../../../src/domain/service/totalExamService";

const totalService = new TotalExamService();

describe('countCommonExam 테스트', () => {
    test('정상 테스트', async () => {
        const commonExamCount = await totalService.countCommonExam();

        const realCommonExamCount = 4;
        expect(commonExamCount).toBe(realCommonExamCount);
    })
})

describe('getScoreRuleData 테스트', () => {
    test('정상 테스트', async () => {
        const commonRound = 2;
        const scoreRule = await totalService.getCommonScoreRule(commonRound);

        const scoreRuleLength = 93;
        expect(scoreRule.length).toBe(scoreRuleLength);
    })
})