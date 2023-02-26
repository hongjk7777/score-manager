import {asClass} from 'awilix'
import container from '../../container';
import TotalExamRepository from "../repository/totalExamRepository";

export default class TotalExamService {
    #totalExamRepository = container.resolve('totalExamRepository');

    async getTotalExam(round, courseId) {
        const totalExam = await this.#totalExamRepository.findByRoundAndCourseId(round, courseId);

        return totalExam;
    }

    async getProblemScores(round, courseId) {
        const totalExam = await this.getTotalExam(round, courseId);

        return totalExam.problemScores;
    }

    async countCommonExam() {
        return await this.#totalExamRepository.findCommonExamCount();
    }

    async getCommonScoreRule(commonRound) {
        const scoreRule = await this.#totalExamRepository.findCommonScoreRule(commonRound);

        const scoreRuleArr = scoreRule.split(/\r\n|\r|\n/);
        const scoreRuleData = new Array();

        scoreRuleArr.forEach(scoreRule => {
            //Array of array 형태로 되어있어야 엑셀에 잘 들어감
            scoreRuleData.push([scoreRule]);
        });

        return scoreRuleData;
    }

    async getScoreRules(round, courseId) {
        const scoreRule = await this.#totalExamRepository.findScoreRule(round, courseId);

        return scoreRule.split(/\r\n|\r|\n/);
    }

    async getClassExamList(courseId) {
        const examList = await this.#totalExamRepository.findByClassId(courseId);
        
        return examList;
    }

    async getCommonRound(round, courseId) {
        const examInfo = await this.#totalExamRepository.findByRoundAndCourseId(round, courseId);

        return examInfo.commonRound;
    }
}


container.register({
    totalExamService: asClass(TotalExamService)
});