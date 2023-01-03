import Course from "../../model/course";
import { asyncDB } from "../dbConfig";

export default class CourseRepository {
    async save(name) {
        const query = `INSERT INTO classes (name, class_day) VALUES ('${name}', '')`;

        const [results] = await asyncDB.execute(query);

        return results.warningStatus === 0;
    }

    async findByName(name) {
        const query = `SELECT id, name FROM classes WHERE name = '${name}'`;

        const [rows] = await asyncDB.execute(query);

        if (rows.length === 0) {
            return null;
        }

        return new Course(rows[0].id, rows[0].name);
    }

    async deleteById(classId) {
        const query = `DELETE FROM classes WHERE id = ${classId}`;

        const [results] = await asyncDB.execute(query);

        return results.warningStatus === 0;
    }
}