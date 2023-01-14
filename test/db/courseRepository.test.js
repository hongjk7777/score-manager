import { async } from "regenerator-runtime";
import CourseRepository from "../../src/domain/db/class/courseRepository";

const courseRepository = new CourseRepository();

describe('통합 테스트', () => {
    test('save find delete 정상 테스트', async () => {
    
        const testClassName = 'testClass';
        expect(await courseRepository.save(testClassName)).toBe(true);

        let findCourse = await courseRepository.findByName(testClassName);
        expect(findCourse.name).toBe(testClassName);

        expect(await courseRepository.deleteById(findCourse.id)).toBe(true);

        findCourse = await courseRepository.findByName(testClassName);
        expect(findCourse).toBe(null);
    })
})