import ExcelJS from "exceljs";
import { async } from "regenerator-runtime";
import { countNumberSize, getScoreStartCol, getMaxCol, getStudentNum, getSchoolCol, getPhoneNumCol, getStudentStartRow } from '../../src/excel/excel.js'

const workbook = new ExcelJS.Workbook();
let testExcel, worksheet;

beforeEach(async () => {
    testExcel = await workbook.xlsx.readFile("test/testResource/testExcel.xlsx");
    worksheet = testExcel.worksheets[0];
});

test('countNumberSize 테스트', () => { 
    const numberSize = countNumberSize("33");
    expect(numberSize).toBe(2);
})

test('getScoreStartCol 테스트', () => { 
    const scoreStartCol = getScoreStartCol(worksheet);
    expect(scoreStartCol).toBe(4);
})

test('getMaxCol 테스트', () => { 
    const scoreStartCol = getMaxCol(worksheet);
    expect(scoreStartCol).toBe(93)
})

test('getStudentStartRow 테스트', () => { 
    const studentStartRow = getStudentStartRow(worksheet);
    expect(studentStartRow).toBe(3);
})

test('getStudentNum 테스트', () => { 
    const studentStartRow = getStudentStartRow(worksheet);
    const scoreStartCol = getStudentNum(studentStartRow, worksheet);
    expect(scoreStartCol).toBe(66)
})

test('getSchoolCol 테스트', () => { 
    const schoolCol = getSchoolCol(worksheet);
    expect(schoolCol).toBe(-1)
})

test('getPhoneNumCol 테스트', () => { 
    const phoneNumCol = getPhoneNumCol(worksheet);
    expect(phoneNumCol).toBe(3)
})
