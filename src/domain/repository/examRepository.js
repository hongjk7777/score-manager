import container from "../../container";
import { asClass } from "awilix";
import ExamDAO from "../dao/examDAO";
import Exam from "../entity/exam";
import { asyncDB } from "./dbConfig";

export default class ExamRepository {
    async save(exam) {
        const query = `INSERT INTO exams(round, common_round, first_score, second_score, third_score, score_sum, ranking, student_id, class_id) 
                    values('${exam.round}', ${exam.commonRound}, '${exam.scores[0]}', '${exam.scores[1]}', '${exam.scores[2]}', 
                    '${exam.scoreSum}', '${exam.ranking}', '${exam.studentId}', '${exam.classId}')`;

        const [result] = await asyncDB.execute(query);

        return result.warningStatus === 0;
    }

    async bulkSave(exams) {
        let query = `INSERT INTO exams(round, common_round, first_score, second_score, third_score, score_sum, ranking, student_id, class_id) values`;

        exams.forEach((exam, index) => {
            if(index === exams.length - 1) {
                query += `('${exam.round}', ${exam.commonRound}, '${exam.scores[0]}', '${exam.scores[1]}', '${exam.scores[2]}', 
                            '${exam.scoreSum}', '${exam.ranking}', '${exam.studentId}', '${exam.classId}')`;
                return;
            }

            query += `('${exam.round}', ${exam.commonRound}, '${exam.scores[0]}', '${exam.scores[1]}', '${exam.scores[2]}', 
            '${exam.scoreSum}', '${exam.ranking}', '${exam.studentId}', '${exam.classId}'),`;
        })
        
        const [result] = await asyncDB.execute(query);

        return result.warningStatus === 0;
    }

    async findByClassId(courseId) {
        const query = `SELECT * FROM exams WHERE class_id = ${courseId}`;

        const [rows] = await asyncDB.execute(query);

        if(rows.length === 0) {
            return new Array();
        }

        return this.#convertToExams(rows);
    }

    #convertToExams(rows) {
        let exams = new Array();

        rows.forEach(row => {
            const scores = new Array(row.first_score, row.second_score, row.third_score);

            exams.push(new Exam(row.round, row.common_round, scores,
                        row.ranking, row.student_id, row.class_id,
                        row.seoul_dept, row.yonsei_dept));
        });

        return exams;
    }

    async findByRoundAndCourseId(round, courseId) {
        const query = `SELECT * FROM exams WHERE round = ${round} AND class_id = ${courseId}`;

        const [rows] = await asyncDB.execute(query);

        if(rows.length === 0) {
            return new Array();
        }

        return this.#convertToExams(rows);
    }

    async findExamRoundCount(courseId) {
        const query = `SELECT MAX(round) as count FROM exams WHERE class_id = ${courseId};`;

        const [rows] = await asyncDB.execute(query);

        if(rows.length === 0) {
            return 0;
        }

        return rows[0].count;
    }
    
    async findAllScoreSum(commonRound) {
        const query = `SELECT score_sum FROM exams WHERE common_round = ${commonRound} ORDER BY score_sum DESC`;
        
        const [rows] = await asyncDB.execute(query);

        if (rows.length === 0) {
            return new Array();
        }

        return rows;
    }

    async findCommonExamRanking(commonRound) {
        const query = `SELECT first_score, second_score, third_score, score_sum, seoul_dept, 
                        yonsei_dept, students.name AS student_name, phone_num, classes.name AS class_name
                        FROM exams INNER JOIN students ON exams.student_id = students.id INNER JOIN classes 
                        ON students.class_id = classes.id WHERE common_round = ${commonRound} ORDER BY score_sum DESC`;

        const [rows] = await asyncDB.execute(query);

        return this.#convertToExamDAOs(rows);
    }

    async findByCommonRound(commonRound) {
        const query = `SELECT * FROM exams WHERE common_round = ${commonRound}`;

        const [rows] = await asyncDB.execute(query);

        if(rows.length === 0) {
            return new Array();
        }

        return this.#convertToExams(rows);
    }

    #convertToExamDAOs(rows) {
        let exams = new Array();

        rows.forEach((row, index) => {
            const scores = new Array(row.first_score, row.second_score, row.third_score);

            exams.push(new ExamDAO(index + 1, scores, row.ranking, row.student_name, 
                row.class_name, row.seoul_dept, row.yonsei_dept, row.phone_num));
        });

        return exams;
    }

    async deleteByClassId(courseId) {
        const query = `DELETE FROM exams WHERE class_id = ${courseId}`;
        
        const [result] = await asyncDB.execute(query);

        return result.warningStatus === 0;
    }

    async updateSeoulDepts(studentDept) {
        const query = `UPDATE exams SET seoul_dept = '${studentDept.seoulDept}'
                        WHERE student_id = ${studentDept.studentId} AND common_round = ${studentDept.commonRound}`;
        
        const [result] = await asyncDB.execute(query);

        return result.warningStatus === 0;           
    }

    async updateYonseiDepts(studentDept) {
        const query = `UPDATE exams SET yonsei_dept = '${studentDept.yonseiDept}' 
                        WHERE student_id = ${studentDept.studentId} AND common_round = ${studentDept.commonRound}`;
        
        const [result] = await asyncDB.execute(query);

        return result.warningStatus === 0;           
    }

    //TODO: 공백이 잘 못 들어가면 어카지?
    async findByCommonRoundAndSeoulDept(commonRound, seoulDept) {
        const query = `SELECT * FROM exams WHERE common_round = ${commonRound} AND seoul_dept = '${seoulDept}'`;

        const [rows] = await asyncDB.execute(query);

        if(rows.length === 0) {
            return new Array();
        }

        return this.#convertToExams(rows);
    }

    //TODO: 공백이 잘 못 들어가면 어카지?
    async findByCommonRoundAndYonseiDept(commonRound, yonseiDept) {
        const query = `SELECT * FROM exams WHERE common_round = ${commonRound} AND yonsei_dept = '${yonseiDept}'`;

        const [rows] = await asyncDB.execute(query);

        if(rows.length === 0) {
            return new Array();
        }

        return this.#convertToExams(rows);
    }
}

container.register({
    examRepository: asClass(ExamRepository)
})