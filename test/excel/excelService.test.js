import { async } from "regenerator-runtime";
import CourseRepository from "../../src/db/class/courseRepository";
import ExcelService from "../../src/excel/excelService";

const excelService = new ExcelService();
const courseRepository = new CourseRepository();
const testClassName = 'excelTest';
let courseId;

const file = { 
    'path' : 'test/testResource/testExcel.xlsx'
};


beforeAll(async () => {
    courseId = await createClass();
})

afterAll(async () => {
    await excelService.deleteClassPrevDB(courseId);
    await deleteClass();
})

async function createClass() {
    expect(await courseRepository.save(testClassName)).toBe(true);

    const findCourse = await courseRepository.findByName(testClassName);
    expect(findCourse.name).toBe(testClassName);

    return findCourse.id;
}

async function deleteClass() {
    expect(await courseRepository.deleteById(courseId)).toBe(true);

    const findCourse = await courseRepository.findByName(testClassName);
    expect(findCourse).toBe(null);
}

describe('putExcelValToDB 테스트', () => {
    test('정상 테스트', async () => {
        await excelService.putExcelValToDB(file, courseId);
    }) 
})