import Student from "../../model/student";
import { asyncDB } from "../dbConfig";

export default class StudentRepository {
    async save(student) {
        const query = `INSERT INTO students(name, phone_num, class_id) 
                    values('${student.name}', '${student.phoneNum}', '${student.classId}')`

        const [result] = await asyncDB.execute(query);

        return result.warningStatus === 0;
    }

    async findByClassId(classId) {
        const query = `SELECT * FROM students WHERE class_id = ${classId}`;

        const [rows] = await asyncDB.execute(query);

        if(rows.length === 0) {
            return new Array();
        }

        return this.#convertToStudents(rows);
    }

    async deleteByClassId(classId) {
        const query = `DELETE FROM students WHERE class_id = ${classId}`;
        
        const [result] = await asyncDB.execute(query);

        return result.warningStatus === 0;
    }

    #convertToStudents(rows) {
        let students = new Array();

        rows.forEach(row => {
            students.push(new Student(row.name, row.phone_num, row.class_id, row.id));
        });

        return students;
    }
}