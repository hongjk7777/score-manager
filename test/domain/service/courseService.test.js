import { async } from "regenerator-runtime";
import Exam from "../../../src/domain/entity/exam";
import Student from "../../../src/domain/entity/student";
import TotalExam from "../../../src/domain/entity/totalExam";
import CourseRepository from "../../../src/domain/repository/courseRepository";
import ExamRepository from "../../../src/domain/repository/examRepository";
import StudentRepository from "../../../src/domain/repository/studentRepository";
import TotalExamRepository from "../../../src/domain/repository/totalExamRepository";
import CourseService from "../../../src/domain/service/courseService";
import ExcelErrorMsg from "../../../src/validator/excelErrorMsg";

const courseService = new CourseService();
const courseRepository = new CourseRepository();

const examRepository = new ExamRepository();
const studentRepository = new StudentRepository();
const totalExamRepository = new TotalExamRepository();

const courseName = 'courseServiceTest';
let courseId;

beforeAll(async () => {
    courseId = await createCourse();
})

afterAll(async () => {
    await deleteCourse(courseId);
})

describe('getAllCourse 테스트', () => {
    test('정상 테스트', async () => {
        const coursees = await courseRepository.findAllClass();
        const findcoursees = await courseService.getAllClass();
        
        expect(findcoursees.length).toBe(coursees.length);
    })
})

describe('saveClass 테스트', () => {
    const courseName = 'courseServiceTest';

    test('정상 테스트', async() => {
        const courseId = await courseService.saveClass(courseName);

        const findCourse = await courseRepository.findById(courseId);
        expect(findCourse).not.toBe(null);

        await courseRepository.deleteById(courseId);

        await expect(courseRepository.findById(courseId))
            .rejects.toThrow(new ReferenceError(ExcelErrorMsg.NO_EXISTENT_CLASS));
    })
});

describe('getCourseName 테스트', () => {
    test('정상 테스트', async () => {
        const name = await courseService.getCourseName(courseId);

        expect(name).toBe(courseName);
    })
})

describe('deleteClass 테스트', () => {
    const courseName = 'courseServiceTest';

    test('정상 테스트', async() => {
        const courseId = await courseService.saveClass(courseName);

        const findCourse = await courseRepository.findById(courseId);
        expect(findCourse).not.toBe(null);

        await courseService.deleteClass(courseId);

        await expect(courseRepository.findById(courseId))
            .rejects.toThrow(new ReferenceError(ExcelErrorMsg.NO_EXISTENT_CLASS));
    })
});

describe('deleteClassPrevDB 테스트', () => {
    test('정상 테스트', async() => {
        const studentId = await studentRepository.save(createStudent());
        await examRepository.save(createExam(studentId));

        let findStudent = await studentRepository.findByCourseId(courseId);
        let findExam = await examRepository.findByClassId(courseId);
        expect(findStudent.length).not.toBe(0);
        expect(findExam.length).not.toBe(0);

        await courseService.deleteClassPrevDB(courseId);

        findStudent = await studentRepository.findByCourseId(courseId);
        findExam = await examRepository.findByClassId(courseId);
        expect(findStudent.length).toBe(0);
        expect(findExam.length).toBe(0);
    })
});

function createStudent() {
    return new Student('test', 0, courseId);
}

function createExam(studentId) {
    return new Exam(1, 0, [0, 0, 0], 0, studentId, courseId);
}

async function createCourse() {
    const courseId = await courseRepository.save(courseName);

    return courseId;
}

async function deleteCourse(courseId) {
    await courseRepository.deleteById(courseId);
}