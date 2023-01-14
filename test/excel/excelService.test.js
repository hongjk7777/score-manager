import ExcelJS from "exceljs";
import CourseRepository from "../../src/domain/db/class/courseRepository";
import ExamRepository from "../../src/domain/db/exam/examRepository";
import StudentRepository from "../../src/domain/db/student/studentRepository";
import ExcelService from "../../src/excel/excelService";
import WorksheetService from "../../src/excel/worksheetService";

const excelService = new ExcelService();
const worksheetService = new WorksheetService();
const courseRepository = new CourseRepository();
const examRepository = new ExamRepository();
const studentRepository = new StudentRepository();
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

describe('putExcelDatasToDB 테스트', () => {
    test('정상 테스트', async () => {
        await excelService.putExcelDatasToDB(examFile, courseId);
        
        const students = await studentRepository.findByCourseId(courseId);
        expect(students.length).toBe(66);

        const exams = await examRepository.findByClassId(courseId);
        expect(exams.length).toBe(579);
    }) 
})

describe('putExcelDatasToDB 테스트', () => {
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