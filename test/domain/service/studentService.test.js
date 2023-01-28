import StudentService from "../../../src/domain/service/studentService";
import CourseRepository from "../../../src/domain/repository/courseRepository";
import StudentRepository from "../../../src/domain/repository/studentRepository";
import Student from "../../../src/domain/entity/student";

const studentService = new StudentService();
const studentRepository = new StudentRepository();
const courseRepository = new CourseRepository();

const courseName = 'serviceServiceTest';
let courseId;

beforeAll(async () => {
    courseId = await createCourse();

    console.log(courseId);
})

async function createCourse() {
    const courseId = await courseRepository.save(courseName);

    return courseId;
}

afterAll(async () => {
    await deleteCourse(courseId);
})

async function deleteCourse(courseId) {
    await studentRepository.deleteByCourseId(courseId);
    await courseRepository.deleteById(courseId);
}

describe('getClassStudentList 테스트', () => {
    //기존에 있는 엑셀로 테스트
    test('정상 테스트', async () => {
        let studentList = await studentService.getClassStudentList(courseId);
        expect(studentList.length).toBe(0);

        const student = createStudent('testStudentList', '000');
        const studentId = await studentRepository.save(student);

        studentList = await studentService.getClassStudentList(courseId);
        expect(studentList.length).toBe(1);

    })
})

describe('getStudentById 테스트', () => {
    //기존에 있는 엑셀로 테스트
    test('정상 테스트', async () => {
        const student = createStudent('testStudentId', '030');
        student.id = await studentRepository.save(student);

        const findStudent = await studentService.getStudentById(student.id)
        expect(findStudent).toEqual(student);
    })
})

describe('getStudentByPhoneNum 테스트', () => {
    //기존에 있는 엑셀로 테스트
    test('정상 테스트', async () => {
        const student = createStudent('testStudentPhoneNum', '040');
        student.id = await studentRepository.save(student);

        const findStudent = await studentService.getStudentByPhoneNNum(student.phoneNum);
        expect(findStudent).toEqual(student);
    })
})

function createStudent(name, phoneNum) {

    return new Student(name, phoneNum, courseId);
}

