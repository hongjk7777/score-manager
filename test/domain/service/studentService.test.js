import StudentService from "../../../src/domain/service/studentService";
import CourseRepository from "../../../src/domain/repository/courseRepository";

const studentService = new StudentService();
const courseRepository = new CourseRepository();

const courseName = 'serviceServiceTest';
const testCourseId = 305;
let courseId;

beforeAll(async () => {
    courseId = await createCourse();

    console.log(courseId);
})

afterAll(async () => {
    await deleteCourse(courseId);
})

describe('getClassStudentList 테스트', () => {
    //기존에 있는 엑셀로 테스트
    test('정상 테스트', async () => {
        let studentList = await studentService.getClassStudentList(testCourseId);
        expect(studentList.length).toBe(52);

        studentList = await studentService.getClassStudentList(courseId);
        expect(studentList.length).toBe(0);
    })
})

async function createCourse() {
    const courseId = await courseRepository.save(courseName);

    return courseId;
}

async function deleteCourse(courseId) {
    await courseRepository.deleteById(courseId);
}