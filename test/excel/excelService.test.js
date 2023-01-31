import ExcelJS from "exceljs";
import container from "../../src/container";
import CourseRepository from "../../src/domain/repository/courseRepository";
import ExamRepository from "../../src/domain/repository/examRepository";
import StudentRepository from "../../src/domain/repository/studentRepository";
import CourseService from "../../src/domain/service/courseService";
import ExcelService from "../../src/excel/excelService";
import WorksheetService from "../../src/excel/worksheetService";
import ExcelErrorMsg from "../../src/validator/excelErrorMsg";

const excelService = container.resolve('excelService');
const courseService = container.resolve('courseService');
const courseRepository = container.resolve('courseRepository');
const examRepository = container.resolve('examRepository')
const studentRepository = container.resolve('studentRepository');
const testClassName = 'excelTest';
let courseId;

const examFile = { 
    'path' : 'test/testResource/testExcel.xlsx'
};

const deptFile = { 
    'path' : 'test/testResource/testDeptExcel2.xlsx'
};

beforeAll(async () => {
    courseId = await createClass();
})

afterAll(async () => {
    await courseService.deleteClassPrevDB(courseId);
    await deleteClass();
})

async function createClass() {
    courseId = await courseRepository.save(testClassName);

    const findCourse = await courseRepository.findById(courseId);
    expect(findCourse.name).toBe(testClassName);

    return findCourse.id;
}

async function deleteClass() {
    expect(await courseRepository.deleteById(courseId)).toBe(true);

    await expect(courseRepository.findById(courseId))
    .rejects
    .toThrow(new ReferenceError(ExcelErrorMsg.NO_EXISTENT_CLASS));
}

describe('putExcelDatasToDB 테스트', () => {
    test('정상 테스트', async () => {
        await excelService.putExcelDatasToDB(examFile, courseId);
        
        const students = await studentRepository.findByCourseId(courseId);
        expect(students.length).toBe(66);

        const exams = await examRepository.findByClassId(courseId);
        expect(exams.length).toBe(580);
    }) 
})

describe('putDeptDatasToDB 테스트', () => {
    test('정상 테스트', async () => {
        await excelService.putDeptDatasToDB(deptFile, courseId);

        const exams = await examRepository.findByClassId(courseId);

        let count = 0;
        exams.forEach((exam) => {
            if(exam.seoulDept || exam.yonseiDept) {
                count++;
            }
        });

        expect(count).toBe(17);
    }) 
})