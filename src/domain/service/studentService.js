import {asClass} from 'awilix';
import container from "../../container";
import StudentRepository from "../repository/studentRepository";

export default class StudentService {
    #studentRepository = container.resolve('studentRepository');

    async getClassStudentList(courseId) {
        const studentList = await this.#studentRepository.findByCourseId(courseId);

        return studentList;
    }

    async getStudentById(studentId) {
        const student = await this.#studentRepository.findById(studentId);

        return student;
    }

    async getStudentByPhoneNNum(phoneNum) {
        const student = await this.#studentRepository.findOneByPhoneNum(phoneNum);

        return student;
    }
}

container.register({
    studentService: asClass(StudentService)
})