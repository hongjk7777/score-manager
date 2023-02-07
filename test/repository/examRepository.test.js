import CourseRepository from "../../src/domain/repository/courseRepository";
import ExamRepository from "../../src/domain/repository/examRepository";
import StudentRepository from "../../src/domain/repository/studentRepository";
import Exam from "../../src/domain/entity/exam";
import container from "../../src/container";
import Student from "../../src/domain/entity/student";

const courseRepository = container.resolve('courseRepository');
const studentRepository = container.resolve('studentRepository');
const examRepository = container.resolve('examRepository');

const testClassName = 'examTestClass';
let testCourseId;
let testStudent;
let testExam;

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

afterAll(async () => {
    //테스트 student 삭제
    await studentRepository.deleteByCourseId(testCourseId);

    const findStudents = await studentRepository.findByCourseId(testCourseId);
    expect(findStudents.length).toBe(0);

    //테스트 class 삭제
    expect(await courseRepository.deleteById(testCourseId)).toBe(true);
})

beforeEach(async () => {
    testExam = createTempExam();

    await examRepository.save(testExam);
})

afterEach(async () => {        
    await examRepository.deleteByClassId(testCourseId);

    const findExams = await examRepository.findByClassId(testCourseId);
    expect(findExams.length).toBe(0);
})

describe('findByClassId 테스트', () => {
    test('정상 테스트', async () => {
        let findExams = await examRepository.findByClassId(testCourseId);

        expect(findExams).toEqual([testExam]);
    })
}) 

describe('findByRoundAndClassId 테스트', () => {
    test('정상 테스트', async () => {
        let findExams = await examRepository.findByRoundAndCourseId(testExam.round, testCourseId);

        expect(findExams).toEqual([testExam]);
    })
}) 

describe('findExamRoundCount 테스트', () => {
    test('정상 테스트', async () => {
        let findExamCount = await examRepository.findExamRoundCount(testCourseId);

        expect(findExamCount).toEqual(testExam.round);
    })
}) 

describe('findAllScoreSum 테스트', () => {
    test('정상 테스트', async () => {
        const results = await examRepository.findAllScoreSum(testExam.commonRound);

        expect(results[0].score_sum).toBe(testExam.scoreSum);
    })
})

describe('findCommonExamRanking 테스트', () => {
    test('정상 테스트', async () => {
        const results = await examRepository.findCommonExamRanking(testExam.commonRound);

        expect(results[0].scores).toEqual(testExam.scores);
    })
})

describe('updateSeoulDepts 테스트', () => {
    test('정상 테스트', async () => {
        const testSeoulDept = 'testSeoulDept';
        const studentDept = createTempSeoulDept(testSeoulDept)

        await examRepository.updateSeoulDepts(studentDept);


        const findExams = await examRepository.findByClassId(testCourseId);

        expect(findExams[0].seoulDept).toBe(testSeoulDept);
    })
})

describe('updateYonseiDepts 테스트', () => {
    test('정상 테스트', async () => {
        const testYonseiDept = 'testYonseiDept';
        const studentDept = createTempYonseiDept(testYonseiDept)

        await examRepository.updateYonseiDepts(studentDept);


        const findExams = await examRepository.findByClassId(testCourseId);

        expect(findExams[0].yonseiDept).toBe(testYonseiDept);
    })
})

describe('findByCommonRoundAndSeoulDept 테스트', () => {
    test('정상 테스트', async () => {
        const testSeoulDept = 'testTestSeoulDept';
        const studentDept = createTempSeoulDept(testSeoulDept)

        await examRepository.updateSeoulDepts(studentDept);

        const findExams = await examRepository.findByCommonRoundAndSeoulDept(testExam.commonRound, testSeoulDept);

        testExam.seoulDept = testSeoulDept;
        expect(findExams).toEqual([testExam]);
    })
})

describe('findByCommonRoundAndYonseiDept 테스트', () => {
    test('정상 테스트', async () => {
        const testYonseiDept = 'testTestYonseiDept';
        const studentDept = createTempYonseiDept(testYonseiDept)

        await examRepository.updateYonseiDepts(studentDept);

        const findExams = await examRepository.findByCommonRoundAndYonseiDept(testExam.commonRound, testYonseiDept);

        testExam.yonseiDept = testYonseiDept;
        expect(findExams).toEqual([testExam]);
    })
})

function createTempStudent(testCourseId) {
    return new Student('testStudent', 'testPhoneNum', testCourseId);
}

function createTempExam() {
    const scores = new Array(1,1,1);

    return new Exam( 1, 100, scores, 1, testStudent.id, testCourseId, null, null);
}

function createTempSeoulDept(testSeoulDept) {
    return {
        'studentId': testExam.studentId,
        'commonRound': testExam.commonRound,
        'seoulDept': testSeoulDept
    };
}

function createTempYonseiDept(testYonseiDept) {
    return {
        'studentId': testExam.studentId,
        'commonRound': testExam.commonRound,
        'yonseiDept': testYonseiDept
    };
}

