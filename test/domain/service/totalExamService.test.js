import container from "../../../src/container";
import TotalExam from "../../../src/domain/entity/totalExam";
import CourseRepository from "../../../src/domain/repository/courseRepository";
import TotalExamRepository from "../../../src/domain/repository/totalExamRepository";
import CourseService from "../../../src/domain/service/courseService";
import TotalExamService from "../../../src/domain/service/totalExamService";

const TEST_ROUND = 1;
const TEST_COMMON_ROUND = 100;

const totalExamService = container.resolve('totalExamService');
const totalExamRepository = container.resolve('totalExamRepository');

const courseService = container.resolve('courseService');
const courseRepository = container.resolve('courseRepository');

let courseId;
let testTotalExam;

beforeAll(async () => {
    await createTestCourse();
})

afterAll(async () => {
    await courseService.deleteClassPrevDB(courseId);
    await courseService.deleteClass(courseId);
})

async function createTestCourse() {
    const testCourseName = 'totalExamServiceTest';

    courseId = await courseRepository.save(testCourseName);

    testTotalExam = createTestTotalExam();
    await totalExamRepository.save(testTotalExam);
}

function createTestTotalExam() {
    return new TotalExam(TEST_ROUND, TEST_COMMON_ROUND, 'scoreRule', courseId, 0, 0, 0, 0, [1, 2, 3]);
}

describe('getTotalExam 테스트', () => {
    test('정상 테스트', async () => {
        const findTotalExam = await totalExamService.getTotalExam(TEST_ROUND, courseId);

        expect(findTotalExam).toEqual(testTotalExam);
    })
})

describe('getProblemScores 테스트', () => {
    test('정상 테스트', async () => {
        const findProblemScores = await totalExamService.getProblemScores(TEST_ROUND, courseId);

        expect(findProblemScores).toEqual(testTotalExam.problemScores);
    })
})

describe('countCommonExam 테스트', () => {
    test('정상 테스트', async () => {
        const commonExamCount = await totalExamService.countCommonExam();

        expect(commonExamCount).toBe(TEST_COMMON_ROUND);
    })
})

describe('getCommonScoreRule 테스트', () => {
    test('정상 테스트', async () => {
        const scoreRule = await totalExamService.getCommonScoreRule(TEST_COMMON_ROUND);

        expect(scoreRule[0][0]).toEqual(testTotalExam.scoreRule);
    })
})

describe('getScoreRules 테스트', () => {
    test('정상 테스트', async () => {
        const findScoreRule = await totalExamService.getScoreRules(TEST_ROUND, courseId);

        expect(findScoreRule[0]).toEqual(testTotalExam.scoreRule);
    })
})

describe('getClassExamList 테스트', () => {
    test('정상 테스트', async () => {
        const findScoreRule = await totalExamService.getScoreRules(TEST_ROUND, courseId);

        expect(findScoreRule[0]).toEqual(testTotalExam.scoreRule);
    })
})

describe('getClassExamList 테스트', () => {
    test('정상 테스트', async () => {
        const classExamList = await totalExamService.getClassExamList(courseId);
        
        expect(classExamList[0]).toEqual(testTotalExam);
    })
})

describe('getCommonRound 테스트', () => {
    test('정상 테스트', async () => {
        const commonRound = await totalExamService.getCommonRound(TEST_ROUND, courseId);
        
        expect(commonRound).toEqual(TEST_COMMON_ROUND);
    })
})