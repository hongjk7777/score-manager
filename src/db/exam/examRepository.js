import Exam from "../../model/exam";
import { asyncDB } from "../dbConfig";

export default class ExamRepository {
    async save(course) {
        const query = `INSERT INTO exams(round, common_round, first_score, second_score, third_score, score_sum, ranking, student_id, class_id) 
                    values('${course.round}', ${course.commonRound}, '${course.scores[0]}', '${course.scores[1]}', '${course.scores[2]}', 
                    '${course.scoreSum}', '${course.ranking}', '${course.studentId}', '${course.classId}')`

        const [result] = await asyncDB.execute(query);

        return result.warningStatus === 0;
    }

    async findByClassId(classId) {
        const query = `SELECT * FROM exams WHERE class_id = ${classId}`;

        const [rows] = await asyncDB.execute(query);

        if(rows.length === 0) {
            return new Array();
        }

        return this.#convertToExams(rows);
    }

    async deleteByClassId(classId) {
        const query = `DELETE FROM exams WHERE class_id = ${classId}`;
        
        const [result] = await asyncDB.execute(query);

        return result.warningStatus === 0;
    }

    #convertToExams(rows) {
        let exams = new Array();

        rows.forEach(row => {
            const scores = new Array(row.first_score, row.second_sore, row.third_score);

            exams.push(new Exam(row.round, row.common_round, scores,
                        row.ranking, row.student_id, row.class_id));
        });

        console.log('examLength: ' + exams.length);

        return exams;
    }
}