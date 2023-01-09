import CourseRepository from "../../src/db/class/courseRepository";
import StudentRepository from "../../src/db/student/studentRepository";
import Student from "../../src/model/student";

const courseRepository = new CourseRepository();
const studentRepository = new StudentRepository();

let testCourse;
const testClassName = 'testClassName';

describe('repo 통합 테스트', () => {

    beforeAll(async () => {
        //테스트 class 생성
        expect(await courseRepository.save(testClassName)).toBe(true);

        testCourse = await courseRepository.findByName(testClassName);
        expect(testCourse.name).toBe(testClassName);
    })

    test('정상 테스트', async () => {
        const student = createTempStudent(testCourse);

        studentRepository.save(student)

        let findStudents = await studentRepository.findByClassId(testCourse.id);
        expect(findStudents.length).toBe(1);

        await studentRepository.deleteByCourseId(testCourse.id);

        findStudents = await studentRepository.findByClassId(testCourse.id);
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