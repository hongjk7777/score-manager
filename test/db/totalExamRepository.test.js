import CourseRepository from "../../src/db/class/courseRepository";
import StudentRepository from "../../src/db/student/studentRepository";
import TotalExamRepository from "../../src/db/totalExam/totalExamRepository";
import TotalExam from "../../src/model/totalExam";
import { createTempStudent } from "./studentRepository.test";

const courseRepository = new CourseRepository();
const studentRepository = new StudentRepository();
const totalExamRepository = new TotalExamRepository();

const testClassName = 'examTestClass';
let testCourse;

describe('repo 통합 테스트', () => {

    beforeAll(async () => {
        //테스트 class 생성
        expect(await courseRepository.save(testClassName)).toBe(true);

        testCourse = await courseRepository.findByName(testClassName);
        expect(testCourse.name).toBe(testClassName);
    })

    test('정상 테스트', async () => {
        const totalExam = createTempTotalExam();

        await totalExamRepository.save(totalExam);

        let findTotalExams = await totalExamRepository.findByClassId(testCourse.id);
        expect(findTotalExams.length).toBe(1);

        await totalExamRepository.deleteByClassId(testCourse.id);

        findTotalExams = await totalExamRepository.findByClassId(testCourse.id);
        expect(findTotalExams.length).toBe(0);
        // examRepository.deleteByClassId();
    })

    afterAll(async () => {
        //테스트 class 삭제
        expect(await courseRepository.deleteById(testCourse.id)).toBe(true);
    })
}) 


function createTempTotalExam() {
    const problemScores = new Array(1,1,1);

    return new TotalExam(1, 1, '', testCourse.id, 1, 
                        1, 1, 1, problemScores);
}

