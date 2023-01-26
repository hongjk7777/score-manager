import CourseRepository from "../repository/courseRepository"
import ExamRepository from "../repository/examRepository";
import StudentRepository from "../repository/studentRepository";
import TotalExamRepository from "../repository/totalExamRepository";

export default class CourseService {
    #courseRepository = new CourseRepository();
    #examRepository = new ExamRepository();
    #studentRepository = new StudentRepository();
    #totalExamRepository = new TotalExamRepository();

    async getAllClass() {
        return await this.#courseRepository.findAllClass();
    }

    async saveClass(className) {
        await this.#courseRepository.save(className);
    }

    async getCourseName(classId) {
        const course = await this.#courseRepository.findById(classId);

        return course.name;
    }

    async deleteClass(classId) {
        await this.deleteClassPrevDB(classId);
        await this.#courseRepository.deleteById(classId);
    }

    async deleteClassPrevDB(classId) {
        let success = false;

        success = await this.#examRepository.deleteByClassId(classId);
        success = await this.#studentRepository.deleteByCourseId(classId);
        success = await this.#totalExamRepository.deleteByClassId(classId);

        return success;
    }
}