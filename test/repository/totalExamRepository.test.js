import CourseRepository from "../../src/domain/repository/courseRepository";
import StudentRepository from "../../src/domain/repository/studentRepository";
import TotalExamRepository from "../../src/domain/repository/totalExamRepository";
import TotalExam from "../../src/domain/entity/totalExam";
import { createTempStudent } from "./studentRepository.test";
import container from "../../src/container";

const courseRepository = container.resolve('courseRepository');
const totalExamRepository = container.resolve('totalExamRepository');

const testCourseName = 'examTestClass';
let testCourse;
let testCourseId;
let testTotalExam;

beforeAll(async () => {
    //테스트 class 생성
    testCourseId = await courseRepository.save(testCourseName);

    testCourse = await courseRepository.findByName(testCourseName);
    expect(testCourse.name).toBe(testCourseName);


    testTotalExam = createTempTotalExam();
    await totalExamRepository.save(testTotalExam);
})

afterAll(async () => {
    await totalExamRepository.deleteByClassId(testCourseId);

    //테스트 class 삭제
    expect(await courseRepository.deleteById(testCourseId)).toBe(true);
})

describe('findByClassId 테스트', () => {
    test('정상 테스트', async () => {

        const examList = await totalExamRepository.findByClassId(testCourseId);

        expect(examList.length).toBe(1);

    }) 
})

describe('findByRoundAndCourseId 테스트', () => {
    test('정상 테스트', async () => {

        const findTotalExam = await totalExamRepository.findByRoundAndCourseId(testTotalExam.round, testCourseId);

        expect(findTotalExam).toEqual(testTotalExam);
    }) 
})

describe('findCommonExamCount 테스트', () => {
    test('정상 테스트', async () => {
        const commonExamCount = await totalExamRepository.findCommonExamCount();

        expect(commonExamCount).toBe(testTotalExam.commonRound);
    }) 
})

describe('findCommonScoreRule 테스트', () => {
    test('정상 테스트', async () => {
        const scoreRule = await totalExamRepository.findCommonScoreRule(testTotalExam.commonRound);
        
        expect(scoreRule).toBe(testTotalExam.scoreRule);
    }) 
})

describe('findScoreRule 테스트', () => {
    test('정상 테스트', async () => {
        const scoreRule = await totalExamRepository.findScoreRule(testTotalExam.round, testCourseId);
        
        expect(scoreRule).toBe(testTotalExam.scoreRule);
    }) 
})


function createTempTotalExam() {
    const problemScores = new Array(1,1,1);

    return new TotalExam(1, 10000, '', testCourseId, 1, 
                        1, 1, 1, problemScores);
}

