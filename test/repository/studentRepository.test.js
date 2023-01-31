import CourseRepository from "../../src/domain/repository/courseRepository";
import StudentRepository from "../../src/domain/repository/studentRepository";
import Student from "../../src/domain/entity/student";
import container from "../../src/container";
import ExcelErrorMsg from "../../src/validator/excelErrorMsg";

const courseRepository = container.resolve('courseRepository');
const studentRepository = container.resolve('studentRepository');

let testCourseId;
const testClassName = 'testClassName';

describe('repo 통합 테스트', () => {

    beforeAll(async () => {
        //테스트 class 생성
        testCourseId = await courseRepository.save(testClassName);
    })

    test('정상 테스트', async () => {
        const student = createTempStudent(testCourseId);

        await studentRepository.save(student)

        let findStudents = await studentRepository.findByCourseId(testCourseId);
        expect(findStudents.length).toBe(1);

        await studentRepository.deleteByCourseId(testCourseId);

        findStudents = await studentRepository.findByCourseId(testCourseId);
        expect(findStudents.length).toBe(0);

        // examRepository.deleteByClassId();
    })

    afterAll(async () => {
        //테스트 class 삭제
        expect(await courseRepository.deleteById(testCourseId)).toBe(true);

        await expect(courseRepository.findById(testCourseId))
            .rejects.toThrow(ReferenceError(ExcelErrorMsg.NO_EXISTENT_CLASS));
    })
}) 

function createTempStudent(testCourseId) {
    return new Student('testStudent', 'testPhoneNum', testCourseId);
}

export {createTempStudent}