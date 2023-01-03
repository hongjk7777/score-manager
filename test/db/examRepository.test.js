import CourseRepository from "../../src/db/class/courseRepository";
import ExamRepository from "../../src/db/exam/examRepository";
import StudentRepository from "../../src/db/student/studentRepository";
import Exam from "../../src/model/exam";
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

        const testStudents = await studentRepository.findByClassId(testCourse.id);
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

    afterEach(async () => {
        //테스트 student 삭제
        await studentRepository.deleteByClassId(testCourse.id);

        const findStudents = await studentRepository.findByClassId(testCourse.id);
        expect(findStudents.length).toBe(0);

        //테스트 class 삭제
        expect(await courseRepository.deleteById(testCourse.id)).toBe(true);
    })
}) 


function createTempExam() {
    const scores = new Array(1,1,1);

    return new Exam( 1, 1, scores, 1, testStudent.id, testCourse.id);
}

