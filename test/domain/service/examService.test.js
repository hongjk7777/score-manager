import { async } from "regenerator-runtime";
import Exam from "../../../src/domain/entity/exam";
import Student from "../../../src/domain/entity/student";
import TotalExam from "../../../src/domain/entity/totalExam";
import CourseRepository from "../../../src/domain/repository/courseRepository";
import ExamRepository from "../../../src/domain/repository/examRepository";
import StudentRepository from "../../../src/domain/repository/studentRepository";
import TotalExamRepository from "../../../src/domain/repository/totalExamRepository";
import CourseService from "../../../src/domain/service/courseService";
import ExamService from "../../../src/domain/service/examService";
import ExcelService from "../../../src/excel/excelService";

const TEST_ROUND = 1;
const TEST_COMMON_ROUND = 100;

const examService = new ExamService();
const examRepository = new ExamRepository();

const courseService = new CourseService();
const courseRepository = new CourseRepository();
const studentRepository = new StudentRepository();
const totalExamRepository = new TotalExamRepository();

let courseId;
const studentIds = [];
const testCourseName = 'examServiceTest';
const testStudentName = 'examServiceTest';

beforeAll(async () => {
    await createTestData();
})

afterAll(async () => {
    await courseService.deleteClassPrevDB(courseId);
    await courseService.deleteClass(courseId);
})

async function createTestData() {
    let studentId;

    courseId = await courseRepository.save(testCourseName);

    studentId = await studentRepository.save(new Student(testStudentName + '1', '0', courseId));
    studentIds.push(studentId);

    studentId = await studentRepository.save(new Student(testStudentName + '2', '0', courseId));
    studentIds.push(studentId);

    const totalExam = createTestTotalExam();
    await totalExamRepository.save(totalExam);

    const exams = createTestExams();

    await examRepository.bulkSave(exams);
}

function createTestTotalExam() {
    return new TotalExam(TEST_ROUND, TEST_COMMON_ROUND, '', courseId, 0, 0, 0, 0, [0, 0, 0]);
}

function createTestExams() {
    const testExams = [];

    const firstScore = [0, 0, 1]
    const secondScore = [0, 0, 0]

    testExams.push(new Exam(TEST_ROUND, TEST_COMMON_ROUND, firstScore, 0, studentIds[0], courseId));
    testExams.push(new Exam(TEST_ROUND, TEST_COMMON_ROUND, secondScore, 0, studentIds[1], courseId));

    return testExams;
}


describe('getScoreDatas 테스트', () => {
    test('정상 테스트', async () => {
        const scoreDatas = await examService.getScoreDatas(TEST_COMMON_ROUND);
        
        expect(scoreDatas[0].점수).toBe(1);
        expect(scoreDatas[0].등수).toBe(1);
        expect(scoreDatas[0].백분위).toEqual((50).toFixed(1));
    })
})

function calcDistribution(scoreData, totalTester) {
    return (((totalTester - scoreData.ranking) / totalTester) * 100).toFixed(1);
}

describe('getRankingDatas 테스트', () =>{
    test('정상 테스트', async () => {
        const rankingData = await examService.getRankingDatas(TEST_COMMON_ROUND);
        const expectData = await examRepository.findCommonExamRanking(TEST_COMMON_ROUND);

        expect(rankingData.length).toBe(expectData.length);
    })
})

describe('getStudentExams 테스트', () =>{
    test('정상 테스트', async () => {
        const studentExams = await examService.getStudentExams(studentIds[0], courseId);

        expect(studentExams.length).toBe(1);
    })
})

describe('getStudentExam 테스트', () =>{
    test('정상 테스트', async () => {
        const exam = await examService.getStudentExam(studentIds[0], TEST_ROUND, courseId);

        expect(exam.commonRound).toBe(TEST_COMMON_ROUND);
    })
})

describe('getExamRankingList 테스트', () =>{
    test('정상 테스트', async () => {
        const rankingList = await examService.getExamRankingList(TEST_ROUND, courseId);
        
        expect(rankingList[0].scoreSum).toBeGreaterThan(rankingList[1].scoreSum);
        expect(rankingList[0].studentName).toBe(testStudentName + '1');
        expect(rankingList[1].studentName).toBe(testStudentName + '2');
    })
})

describe('getExamRankingList 테스트', () =>{
    test('정상 테스트', async () => {
        const sortedExams = await examService.getSortedExams(TEST_ROUND, courseId);
        
        expect(sortedExams[0].scoreSum).toBeGreaterThan(sortedExams[1].scoreSum);
    })
})