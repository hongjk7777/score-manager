import ExcelErrorMsg from "../../../validator/excelErrorMsg";
import Course from "../../entity/course";
import { asyncDB } from "../dbConfig";

export default class CourseRepository {
    async save(name) {
        const query = `INSERT INTO classes (name, class_day) VALUES ('${name}', '')`;

        const [results] = await asyncDB.execute(query);

        return results.insertId;;
    }

    async findByName(name) {
        const query = `SELECT id, name FROM classes WHERE name = '${name}'`;

        const [rows] = await asyncDB.execute(query);

        if (rows.length === 0) {
            return null;
        }

        return new Course(rows[0].id, rows[0].name);
    }

    async findById(classId) {
        const query = `SELECT * FROM classes WHERE id = ${classId}`;

        const [rows] = await asyncDB.execute(query);

        if (rows.length === 0) {
            throw new ReferenceError(ExcelErrorMsg.NO_EXISTENT_CLASS);
        }

        return new Course(rows[0].id, rows[0].name);
    }

    async findAllClass() {
        const query = `SELECT * FROM classes WHERE id > 10`;

        const [rows] = await asyncDB.execute(query);

        if (rows.length === 0) {
            return new Array();
        }

        return rows;
    }

    async deleteById(classId) {
        const query = `DELETE FROM classes WHERE id = ${classId}`;

        const [results] = await asyncDB.execute(query);

        return results.warningStatus === 0;
    }
}