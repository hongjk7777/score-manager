import CourseRepository from "../../src/domain/repository/courseRepository";
import StudentRepository from "../../src/domain/repository/studentRepository";
import Student from "../../src/domain/entity/student";
import container from "../../src/container";
import ExcelErrorMsg from "../../src/validator/excelErrorMsg";

const courseRepository = container.resolve('courseRepository');
const studentRepository = container.resolve('studentRepository');

let testStudent;
let testCourseId;
const testClassName = 'testClassName';

beforeAll(async () => {
    //테스트 class 생성
    testCourseId = await courseRepository.save(testClassName);
})

afterAll(async () => {
    //테스트 class 삭제
    expect(await courseRepository.deleteById(testCourseId)).toBe(true);

    await expect(courseRepository.findById(testCourseId))
        .rejects.toThrow(ReferenceError(ExcelErrorMsg.NO_EXISTENT_CLASS));
})

beforeEach(async () => {
    //테스트 student 생성
    testStudent = createTempStudent(testCourseId);

    testStudent.id = await studentRepository.save(testStudent)
})

afterEach(async () => {
    //테스트 student 삭제
    await studentRepository.deleteByCourseId(testCourseId);

    const findStudent = await studentRepository.findByCourseId(testCourseId);
    expect(findStudent.length).toBe(0);
})

describe('repo 통합 테스트', () => {
    test('정상 테스트', async () => {
        const findStudent = await studentRepository.findById(testStudent.id);
        expect(findStudent).toEqual(testStudent);

        // examRepository.deleteByClassId();
    })
})

describe('findById 테스트', () => {
    test('정상 테스트', async () => {
        const findStudent = await studentRepository.findById(testStudent.id);

        expect(findStudent).toEqual(testStudent);
    })
})

describe('findByCourseId 테스트', () => {
    test('정상 테스트', async () => {
        const students = await studentRepository.findByCourseId(testCourseId);

        expect(students).toEqual([testStudent]);
    })
})

describe('findOneByPhoneNum 테스트', () => {
    test('정상 테스트', async () => {
        const findStudent = await studentRepository.findOneByPhoneNum(testStudent.phoneNum);

        expect(findStudent).toEqual(testStudent);
    })
})

describe('findOneByPhoneNumAndCourseId 테스트', () => {
    test('정상 테스트', async () => {
        const findStudent = await studentRepository.findOneByPhoneNumAndCourseId(testStudent.phoneNum, testCourseId);

        expect(findStudent).toEqual(testStudent);
    })
})

describe('findOneByNameAndCourseId 테스트', () => {
    test('정상 테스트', async () => {
        const findStudent = await studentRepository.findOneByNameAndCourseId(testStudent.name, testCourseId);

        expect(findStudent).toEqual(testStudent);
    })
})

function createTempStudent(testCourseId) {
    return new Student('testStudent', 'testPhoneNum', testCourseId);
}

export {createTempStudent}