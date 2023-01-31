import CourseRepository from "../../src/domain/repository/courseRepository";
import container from "../../src/container";

const courseRepository = container.resolve('courseRepository');
const courseName = 'testCourse';
let courseId;

beforeAll(async () => {
    courseId = await courseRepository.save(courseName);

})

afterAll(async () => {
    await courseRepository.deleteById(courseId);
});

describe('통합 테스트', () => {
    test('save find delete 정상 테스트', async () => {
    
        const testClassName = 'testClass';

        await courseRepository.save(testClassName);

        let findCourse = await courseRepository.findByName(testClassName);
        expect(findCourse.name).toBe(testClassName);

        expect(await courseRepository.deleteById(findCourse.id)).toBe(true);

        findCourse = await courseRepository.findByName(testClassName);
        expect(findCourse).toBe(null);
    })
})

describe('findAllClass 테스트', () => {
    test('정상 테스트', async () => {
        let classes = await courseRepository.findAllClass();
        const beforeCount = classes.length;

        const courseName = 'findAllTestClass';
        const courseId = await courseRepository.save(courseName);
        classes = await courseRepository.findAllClass();
        expect(beforeCount).toBe(classes.length - 1);

        await courseRepository.deleteById(courseId);
        classes = await courseRepository.findAllClass();
        expect(beforeCount).toBe(classes.length);
    })
})

describe('findById 테스트', () => {
    test('정상 테스트', async() => {
        const courseName = 'findIdTestClass';
        const courseId = await courseRepository.save(courseName);
        const findClass = await courseRepository.findById(courseId);

        expect(findClass.name).toBe(courseName);

        await courseRepository.deleteById(courseId)
    })
})