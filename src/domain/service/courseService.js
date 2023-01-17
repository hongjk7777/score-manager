import CourseRepository from "../db/class/courseRepository"

export default class CourseService {
    #courseRepository = new CourseRepository();

    async getAllClass() {
        return await this.#courseRepository.findAllClass();
    }

    async saveClass(className) {
        await this.#courseRepository.save(className);
    }
}