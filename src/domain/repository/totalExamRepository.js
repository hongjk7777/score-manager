import {asClass} from 'awilix'
import container from '../../container';
import ExcelErrorMsg from "../../validator/excelErrorMsg";
import TotalExam from "../entity/totalExam";
import { asyncDB } from "./dbConfig";

export default class TotalExamRepository {
    async save(totalExam) {
        const query = `INSERT INTO total_exams(round, common_round, score_rule, class_id
            , total_tester, average, standard_deviation, max_score, first_problem_score, 
                second_problem_score, third_problem_score) VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                

        const [result] = await asyncDB.execute(query, [totalExam.round, totalExam.commonRound, totalExam.scoreRule,
            totalExam.classId, totalExam.totalTester, totalExam.average, totalExam.standardDeviation, totalExam.maxScore,
            totalExam.problemScores[0], totalExam.problemScores[1], totalExam.problemScores[2]]);

        return result.warningStatus === 0;
    }

    async findByClassId(courseId) {
        const query = `SELECT * FROM total_exams WHERE class_id = ${courseId}`;

        const [rows] = await asyncDB.execute(query);

        if(rows.length === 0) {
            return new Array();
        }

        return this.#convertToTotalExams(rows);
    }

    async findByRoundAndCourseId(round, courseId) {
        const query = `SELECT * FROM total_exams WHERE class_id = ${courseId} AND round = ${round}`;

        const [rows] = await asyncDB.execute(query);

        if(rows.length === 0) {
            throw new ReferenceError(ExcelErrorMsg.NO_EXISTENT_EXAM);
        }

        return this.#convertToTotalExam(rows[0]);
    }

    async findCommonExamCount() {
        const query = `SELECT MAX(common_round) as count FROM total_exams;`;

        const [rows] = await asyncDB.execute(query);

        if(rows.length === 0) {
            return 0;
        }

        return rows[0].count;
    }

    async findCommonScoreRule(commonRound) {
        const query = `SELECT score_rule FROM total_exams WHERE common_round = ${commonRound};`;

        const [rows] = await asyncDB.execute(query);

        if(rows.length === 0) {
            return '';
        }

        const scoreRule = rows[0].score_rule;

        return scoreRule.replaceAll('$', '');
    }

    async findScoreRule(round, courseId) {
        const query = `SELECT score_rule FROM total_exams WHERE round = ${round} AND class_id = ${courseId};`;

        const [rows] = await asyncDB.execute(query);

        if(rows.length === 0) {
            return '';
        }

        const scoreRule = rows[0].score_rule;

        return scoreRule.replaceAll('$', '');
    }
 
    async deleteByClassId(courseId) {
        const query = `DELETE FROM total_exams WHERE class_id = ${courseId}`;

        const [result] = await asyncDB.execute(query);

        return result.warningStatus === 0;
    }

    #convertToTotalExams(rows) {
        let totalExams = new Array();

        rows.forEach(row => {
            const totalExam = this.#convertToTotalExam(row);

            totalExams.push(totalExam);
        });

        return totalExams;
    }

    #convertToTotalExam(row) {
        const problemScores = new Array(row.first_problem_score, row.second_problem_score, row.third_problem_score);
      
        const totalExam = new TotalExam(row.round, row.common_round, row.score_rule, row.class_id, row.total_tester, 
            row.average, row.standard_deviation, row.max_score, problemScores)

        return totalExam;
    }    
}

container.register({
    totalExamRepository: asClass(TotalExamRepository)
});