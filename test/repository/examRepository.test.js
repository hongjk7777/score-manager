import CourseRepository from "../../src/domain/repository/courseRepository";
import ExamRepository from "../../src/domain/repository/examRepository";
import StudentRepository from "../../src/domain/repository/studentRepository";
import Exam from "../../src/domain/entity/exam";
import { createTempStudent } from "./studentRepository.test";
import container from "../../src/container";

const courseRepository = container.resolve('courseRepository');
const studentRepository = container.resolve('studentRepository');
const examRepository = container.resolve('examRepository');

const testClassName = 'examTestClass';
let testCourseId;
let testStudent;

describe('repo 통합 테스트', () => {

    beforeAll(async () => {
        //테스트 class 생성
        testCourseId = await courseRepository.save(testClassName);

        //테스트 student 생성
        const student = createTempStudent(testCourseId);

        await studentRepository.save(student)

        const testStudents = await studentRepository.findByCourseId(testCourseId);
        expect(testStudents.length).toBe(1);

        testStudent = testStudents[0];
    })

    test('정상 테스트', async () => {
        const exam = createTempExam();

        await examRepository.save(exam);

        let findExams = await examRepository.findByClassId(testCourseId);
        expect(findExams.length).toBe(1);

        await examRepository.deleteByClassId(testCourseId);

        findExams = await examRepository.findByClassId(testCourseId);
        expect(findExams.length).toBe(0);
        // examRepository.deleteByClassId();
    })

    afterAll(async () => {
        //테스트 student 삭제
        await studentRepository.deleteByCourseId(testCourseId);

        const findStudents = await studentRepository.findByCourseId(testCourseId);
        expect(findStudents.length).toBe(0);

        //테스트 class 삭제
        expect(await courseRepository.deleteById(testCourseId)).toBe(true);
    })
}) 

describe('findAllScoreSum 테스트', () => {
    test('정상 테스트', async () => {
        const commonRound = 2;
        const results = await examRepository.findAllScoreSum(commonRound);

        expect(results.length).toBe(284);
    })
})

describe('findCommonExamRanking 테스트', () => {
    test('정상 테스트', async () => {
        const commonRound = 2;
        const results = await examRepository.findCommonExamRanking(commonRound);

        expect(results.length).toBe(284);
    })
})


function createTempExam() {
    const scores = new Array(1,1,1);

    return new Exam( 1, 1, scores, 1, testStudent.id, testCourseId);
}

