import CourseRepository from "../../src/domain/db/class/courseRepository";
import ExamRepository from "../../src/domain/db/exam/examRepository";
import StudentRepository from "../../src/domain/db/student/studentRepository";
import Exam from "../../src/domain/entity/exam";
import { createTempStudent } from "./studentRepository.test";

const courseRepository = new CourseRepository();
const studentRepository = new StudentRepository();
const examRepository = new ExamRepository();

const testClassName = 'examTestClass';
let testCourse;
let testStudent;

describe('repo 통합 테스트', () => {

    beforeAll(async () => {
        //테스트 class 생성
        expect(await courseRepository.save(testClassName)).toBe(true);

        testCourse = await courseRepository.findByName(testClassName);
        expect(testCourse.name).toBe(testClassName);

        //테스트 student 생성
        const student = createTempStudent(testCourse);

        await studentRepository.save(student)

        const testStudents = await studentRepository.findByCourseId(testCourse.id);
        expect(testStudents.length).toBe(1);

        testStudent = testStudents[0];
    })

    test('정상 테스트', async () => {
        const exam = createTempExam();

        await examRepository.save(exam);

        let findExams = await examRepository.findByClassId(testCourse.id);
        expect(findExams.length).toBe(1);

        await examRepository.deleteByClassId(testCourse.id);

        findExams = await examRepository.findByClassId(testCourse.id);
        expect(findExams.length).toBe(0);
        // examRepository.deleteByClassId();
    })

    afterAll(async () => {
        //테스트 student 삭제
        await studentRepository.deleteByCourseId(testCourse.id);

        const findStudents = await studentRepository.findByCourseId(testCourse.id);
        expect(findStudents.length).toBe(0);

        //테스트 class 삭제
        expect(await courseRepository.deleteById(testCourse.id)).toBe(true);
    })
}) 

describe('findAllScoreSum 테스트', () => {
    test('정상 테스트', async () => {
        const commonRound = 2;
        const results = await examRepository.findAllScoreSum(commonRound);

        expect(results.length).toBe(315);
    })
})

describe('findCommonExamRanking 테스트', () => {
    test('정상 테스트', async () => {
        const commonRound = 2;
        const results = await examRepository.findCommonExamRanking(commonRound);

        expect(results.length).toBe(315);
    })
})


function createTempExam() {
    const scores = new Array(1,1,1);

    return new Exam( 1, 1, scores, 1, testStudent.id, testCourse.id);
}

