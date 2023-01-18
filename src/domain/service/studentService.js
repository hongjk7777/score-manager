import StudentRepository from "../db/student/studentRepository";

export default class StudentService {
    #studentRepository = new StudentRepository();

    async getClassStudentList(courseId) {
        const studentList = await this.#studentRepository.findByCourseId(courseId);

        return studentList;
    }

    async getStudent(studentId) {
        const student = await this.#studentRepository.findById(studentId);

        return student;
    }
}