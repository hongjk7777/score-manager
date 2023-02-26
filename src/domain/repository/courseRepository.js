import container from "../../container";
import { asClass } from "awilix";
import ExcelErrorMsg from "../../validator/excelErrorMsg";
import Course from "../entity/course";
import { asyncDB } from "./dbConfig";

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

    async findById(courseId) {
        const query = `SELECT * FROM classes WHERE id = ${courseId}`;

        const [rows] = await asyncDB.execute(query);

        if (rows.length === 0) {
            throw new ReferenceError(ExcelErrorMsg.NO_EXISTENT_CLASS);
        }

        return new Course(rows[0].id, rows[0].name);
    }

    async findAllClass() {
        const query = `SELECT * FROM classes WHERE id > 30`;

        const [rows] = await asyncDB.execute(query);

        if (rows.length === 0) {
            return new Array();
        }

        return rows;
    }

    async deleteById(courseId) {
        const query = `DELETE FROM classes WHERE id = ${courseId}`;

        const [results] = await asyncDB.execute(query);

        return results.warningStatus === 0;
    }
}

container.register({
    courseRepository: asClass(CourseRepository)
})