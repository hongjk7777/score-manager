import StudentRepository from "../db/student/studentRepository";

export default class StudentService {
    #studentRepository = new StudentRepository();

    async getClassStudentList(courseId) {
        const studentList = await this.#studentRepository.findByCourseId(courseId);

        return studentList;
    }


}