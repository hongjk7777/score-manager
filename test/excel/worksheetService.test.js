import ExcelJS from "exceljs";
import { async } from "regenerator-runtime";
import CourseRepository from "../../src/db/class/courseRepository";
import StudentRepository from "../../src/db/student/studentRepository";
import WorksheetService from "../../src/excel/worksheetService";

const workbook = new ExcelJS.Workbook();
const path = 'test/testResource/testExcel.xlsx';
const deptPath = 'test/testResource/testDeptExcel.xlsx';

const worksheetService = new WorksheetService();
const studentRepository = new StudentRepository();
const courseRepository = new CourseRepository();
const testClassName = 'worksheetTest';
let courseId;
let excel;

beforeAll(async () => {
    excel = await workbook.xlsx.readFile(path);
    courseId = await createClass();
})

afterAll(async () => {
    await studentRepository.deleteByCourseId(courseId);
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

describe('getScoreRule 테스트', () => {
    test('정상 테스트', async () => {

        const worksheetName = '테스트(1) 채점기준';
        const scoreRuleWorksheet = excel.getWorksheet(worksheetName);
        const scoreRule = worksheetService.getScoreRule(scoreRuleWorksheet);

        scoreRuleWorksheet.getColumn(1).eachCell((cell) => {
            if(cell.value) {
                if(cell.value.richText){
                    //폰트가 있는 경우
                    cell.value.richText.forEach(obj => {
                        expect(scoreRule.includes(obj.text)).toBe(true);
                    });
                    
                } else{
                    //폰트가 없는 경우
                    expect(scoreRule.includes(cell.value)).toBe(true);
                }
            }
        });

    });
})

describe('findWorksheetByName 테스트', () => {
    test('띄어쓰기 없는 경우 정상 테스트', async () => {
        const partialWorksheetName = '테스트(1)';
        const worksheet = worksheetService.findWorksheetByName(partialWorksheetName, excel);
        
        const worksheetName = '테스트(1) 채점기준';
        const realWorksheet = excel.getWorksheet(worksheetName);

        expect(worksheet.name).toBe(realWorksheet.name);
    });

    test('띄어쓰기가 있는 경우 정상 테스트', async () => {
        //현재 테스트 엑셀에는 테스트(2) 채 점 기 준 과 같이 띄어쓰기가 되어 있다.
        const partialWorksheetName = '테스트(2)';
        const worksheet = worksheetService.findWorksheetByName(partialWorksheetName, excel);
        
        const worksheetName = '테스트(2) 채 점 기 준';
        const realWorksheet = excel.getWorksheet(worksheetName);

        expect(worksheet.name).toBe(realWorksheet.name);
    });
})

describe('extractStudents 테스트', () => {
    test('띄어쓰기 없는 경우 정상 테스트', async () => {
        const personalWorksheetName = '개인별';
        const worksheet = worksheetService.findWorksheetByName(personalWorksheetName, excel);

        const students = worksheetService.extractStudents(worksheet, courseId);

        const testStudentLength = 66;
        
        expect(students.length).toBe(testStudentLength);
    });
})

describe('extractRoundExams 테스트', () => {
    test('정상 테스트', async () => {
        const personalWorksheetName = '개인별';
        const worksheet = worksheetService.findWorksheetByName(personalWorksheetName, excel);

        const students = worksheetService.extractStudents(worksheet, courseId);
            students.forEach(async (student) => {
                await studentRepository.save(student);
        })

        const roundExams = await worksheetService.extractRoundExams(worksheet, courseId);

        const testers = [37, 46, 43, 40, 43, 40, 38, 24];
        testers.forEach((value, round) => {
            expect(roundExams[round].length).toBe(testers[round]);
        })
    });
})

describe('extractRoundDeptDatas 테스트', () => {
    test('정상 테스트', async () => {
        const deptExcel = await workbook.xlsx.readFile(deptPath);
        const worksheet = deptExcel.worksheets[0];

        const students = worksheetService.extractStudents(worksheet, courseId);
        
        for(const student of students) {
            await studentRepository.save(student);
        }
        
        expect(students.length).toBe(36)

        const roundDeptDatas = await worksheetService.extractRoundDeptDatas(worksheet, courseId);

        console.log(roundDeptDatas);
        const testers = [23, 23, 0, 0, 0];

        roundDeptDatas.forEach((value, index) => {
            expect(value.length).toBe(testers[index]);
        });

    });
})



// 성적 칸에 띄어쓰기 한번하고 해보기