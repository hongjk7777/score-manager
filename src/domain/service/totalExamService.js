import TotalExamRepository from "../db/totalExam/totalExamRepository";

export default class TotalExamService {
    #totalExamRepository = new TotalExamRepository();


    async getProblemScores(round, classId) {
        const totalExam = await this.getTotalExam(round, classId);

        return totalExam.problemScores;
    }

    async countCommonExam() {
        return await this.#totalExamRepository.findCommonExamCount();
    }

    async getScoreRuleData(commonRound) {
        let scoreRule = await this.#totalExamRepository.findScoreRule(commonRound);

        const scoreRuleArr = scoreRule.split(/\r\n|\r|\n/);
        const scoreRuleData = new Array();

        scoreRuleArr.forEach(scoreRule => {
            //Array of array 형태로 되어있어야 엑셀에 잘 들어감
            scoreRuleData.push([scoreRule]);
        });

        return scoreRuleData;
    }

    async getScoreRules(round, classId) {
        const scoreRule = await this.#totalExamRepository.findScoreRule(round, classId);

        return scoreRule.split(/\r\n|\r|\n/);
    }

    async getClassExamList(courseId) {
        const examList = await this.#totalExamRepository.findByClassId(courseId);
        
        return examList;
    }

    async getCommonRound(round, courseId) {
        const examInfo = await this.#totalExamRepository.findByRoundAndClassId(round, courseId);

        return examInfo.commonRound;
    }
}