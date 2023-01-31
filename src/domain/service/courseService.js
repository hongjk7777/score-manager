import { asClass } from "awilix";
import container from "../../container";
import CourseRepository from "../repository/courseRepository"
import ExamRepository from "../repository/examRepository";
import StudentRepository from "../repository/studentRepository";
import TotalExamRepository from "../repository/totalExamRepository";

export default class CourseService {
    #courseRepository = container.resolve('courseRepository');
    #examRepository = container.resolve('examRepository');
    #studentRepository = container.resolve('studentRepository');
    #totalExamRepository = container.resolve('totalExamRepository');

    async getAllClass() {
        return await this.#courseRepository.findAllClass();
    }

    async saveClass(className) {
        return await this.#courseRepository.save(className);
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

container.register({
    courseService : asClass(CourseService)
})