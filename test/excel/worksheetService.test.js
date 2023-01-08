import ExcelJS from "exceljs";
import { async } from "regenerator-runtime";
import CourseRepository from "../../src/db/class/courseRepository";
import WorksheetService from "../../src/excel/worksheetService";

const workbook = new ExcelJS.Workbook();
const path = 'test/testResource/testExcel.xlsx';

const worksheetService = new WorksheetService();
const courseRepository = new CourseRepository();
const testClassName = 'worksheetTest';
let courseId;
let excel;

beforeAll(async () => {
    excel = await workbook.xlsx.readFile(path);

    courseId = await createClass();
})

async function createClass() {
    expect(await courseRepository.save(testClassName)).toBe(true);

    const findCourse = await courseRepository.findByName(testClassName);
    expect(findCourse.name).toBe(testClassName);

    return findCourse.id;
}

afterAll(async () => {
    await deleteClass();
})

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

describe('getScoreRule 테스트', () => {
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
