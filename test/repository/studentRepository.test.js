import CourseRepository from "../../src/domain/repository/courseRepository";
import StudentRepository from "../../src/domain/repository/studentRepository";
import Student from "../../src/domain/entity/student";

const courseRepository = new CourseRepository();
const studentRepository = new StudentRepository();

let testCourse;
const testClassName = 'testClassName';

describe('repo 통합 테스트', () => {

    beforeAll(async () => {
        //테스트 class 생성
        await courseRepository.save(testClassName);

        testCourse = await courseRepository.findByName(testClassName);
        expect(testCourse.name).toBe(testClassName);
    })

    test('정상 테스트', async () => {
        const student = createTempStudent(testCourse);

        await studentRepository.save(student)

        let findStudents = await studentRepository.findByCourseId(testCourse.id);
        expect(findStudents.length).toBe(1);

        await studentRepository.deleteByCourseId(testCourse.id);

        findStudents = await studentRepository.findByCourseId(testCourse.id);
        expect(findStudents.length).toBe(0);

        // examRepository.deleteByClassId();
    })

    afterAll(async () => {
        //테스트 class 삭제
        expect(await courseRepository.deleteById(testCourse.id)).toBe(true);

        testCourse = await courseRepository.findByName(testClassName);
        expect(testCourse).toBe(null);
    })
}) 

function createTempStudent(testCourse) {
    return new Student('testStudent', 'testPhoneNum', testCourse.id);
}

export {createTempStudent}