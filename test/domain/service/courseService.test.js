import CourseRepository from "../../../src/domain/db/class/courseRepository";
import CourseService from "../../../src/domain/service/courseService";

const courseService = new CourseService();
const courseRepository = new CourseRepository();

const courseName = 'courseServiceTest';
let courseId;

beforeAll(async () => {
    courseId = await createCourse();
    console.log(courseId);
})

afterAll(async () => {
    await deleteCourse(courseId);
})

describe('getCourseName 테스트', () => {
    test('정상 테스트', async () => {
        const name = await courseService.getCourseName(courseId);

        expect(name).toBe(courseName);
    })
})

async function createCourse() {
    const courseId = await courseRepository.save(courseName);

    return courseId;
}

async function deleteCourse(courseId) {
    await courseRepository.deleteById(courseId);
}