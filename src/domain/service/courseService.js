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

    async getCourseName(courseId) {
        const course = await this.#courseRepository.findById(courseId);

        return course.name;
    }

    async deleteClass(courseId) {
        await this.deleteClassPrevDB(courseId);
        await this.#courseRepository.deleteById(courseId);
    }

    async deleteClassPrevDB(courseId) {
        let success = false;

        success = await this.#examRepository.deleteByClassId(courseId);
        success = await this.#studentRepository.deleteByCourseId(courseId);
        success = await this.#totalExamRepository.deleteByClassId(courseId);

        return success;
    }
}

container.register({
    courseService : asClass(CourseService)
})