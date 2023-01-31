import CourseRepository from "../../src/domain/repository/courseRepository";
import StudentRepository from "../../src/domain/repository/studentRepository";
import TotalExamRepository from "../../src/domain/repository/totalExamRepository";
import TotalExam from "../../src/domain/entity/totalExam";
import { createTempStudent } from "./studentRepository.test";
import container from "../../src/container";

const courseRepository = container.resolve('courseRepository');
const totalExamRepository = container.resolve('totalExamRepository');

const testCourseName = 'examTestClass';
const testCourseId = 305;
let testCourse;

describe('repo 통합 테스트', () => {

    beforeAll(async () => {
        //테스트 class 생성
        await courseRepository.save(testCourseName);

        testCourse = await courseRepository.findByName(testCourseName);
        expect(testCourse.name).toBe(testCourseName);
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

describe('findByClassId 테스트', () => {
    test('정상 테스트', async () => {
        const examList = await totalExamRepository.findByClassId(testCourseId);
        
        console.log(examList);
    }) 
})

describe('findCommonExamCount 테스트', () => {
    test('정상 테스트', async () => {
        const commonExamCount = await totalExamRepository.findCommonExamCount();

        const realExamCount = 4;

        expect(commonExamCount).toBe(realExamCount);
    }) 
})

describe('findScoreRule 테스트', () => {
    test('정상 테스트', async () => {
        const commonRound = 2;
        const scoreRule = await totalExamRepository.findCommonScoreRule(commonRound);
        
        console.log(scoreRule);
    }) 
})


function createTempTotalExam() {
    const problemScores = new Array(1,1,1);

    return new TotalExam(1, 1, '', testCourse.id, 1, 
                        1, 1, 1, problemScores);
}

