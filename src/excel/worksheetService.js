import { Workbook } from "exceljs";
import StudentRepository from "../domain/repository/studentRepository";
import Exam from "../domain/entity/exam";
import ExamScore from "../domain/entity/examScore";
import Student from "../domain/entity/student";
import StudentDept from "../domain/entity/studentDept";
import ExcelErrorMsg from "../validator/excelErrorMsg";
import CellService from "./cellService";
import container from "../container";
import { asClass } from "awilix";

//TODO: cell에서 하는 작업음 cellService로 분리하는 게 더 나을 듯?
export default class WorksheetService {    
    INDEX_ROW = 2;
    COMMON_ROUND_ROW = 1;

    #cellService = container.resolve('cellService');
    #studentRepository = container.resolve('studentRepository');


    findWorksheetByName(name, excel) {
        let worksheetId = -1;

        excel.eachSheet((worksheet, id) => {
            if(worksheet.name.includes(name)) {
                worksheetId = id;
            }
        });

        if(worksheetId == -1) {
            return null;
        }

        return excel.getWorksheet(worksheetId);
    }

    extractStudents(worksheet, courseId) {
        const students = this.#getStudents(worksheet, courseId);

        return students;
    }

    #getStudents(worksheet, classId) {
        const students = new Array();
        const indexRow = this.#getIndexRow(worksheet);
        const nameCol = this.#getNameCol(indexRow);
        const phoneNumCol = this.#getPhoneNumCol(indexRow);
        const studentNumCol = this.#getStudentNumCol(indexRow);
        const studentRows = this.#getStudentRows(worksheet, nameCol, studentNumCol);

        studentRows.forEach((row) => {
            const name = this.#getName(row, nameCol);
            const phoneNum = this.#getPhoneNum(row, phoneNumCol);

            students.push(new Student(name, phoneNum, classId));
        })

        return students;
    }

    #getNameCol(indexRow) {
        let nameCol = -1;

        indexRow.eachCell((cell, col) => {
            if(this.#cellService.isNameIndexCell(cell)) {
                nameCol = col;
                return;
            }
        });

        if(nameCol === -1) {
            throw SyntaxError(ExcelErrorMsg.NO_STUDENT_NAME_COL);
        }

        return nameCol;
    }

    #getPhoneNumCol(indexRow) {
        let phoneNumCol = -1;

        indexRow.eachCell((cell, col) => {
            if(this.#cellService.isPhoneNumIndexCell(cell)) {
                phoneNumCol = col;
                return;
            }
        });

        if(phoneNumCol === -1) {
            throw SyntaxError(ExcelErrorMsg.NO_PHONE_NUM_COL);
        }

        return phoneNumCol;
    }

    #getStudentNumCol(indexRow) {
        let studentNumCol = -1;

        indexRow.eachCell((cell, col) => {
            if(this.#cellService.isStudentNumIndexCell(cell)) {
                studentNumCol = col;
                return;
            }
        });

        if(studentNumCol === -1) {
            throw SyntaxError(ExcelErrorMsg.NO_STUDENT_NUM_INDEX);
        }

        return studentNumCol;
    }

    #getStudentRows(worksheet, nameCol, studentNumCol) {
        const studentRows = new Array();

        worksheet.eachRow((row) => {
            const studentNumCell = row.getCell(studentNumCol);
            const studentNameCell = row.getCell(nameCol);

            if(this.#cellService.isStudentNumCell(studentNumCell) &&
                this.#cellService.isStudentNameCell(studentNameCell)) {
                studentRows.push(row);
            } 
        })

        return studentRows;
    }

    #getName(row, nameCol) {
        const nameCell = row.getCell(nameCol);

        if(nameCell.value) {
            return nameCell.value;
        }

        throw new SyntaxError(ExcelErrorMsg.INCORRECT_STUDENT_NAME_INDEX);
    }

    #getPhoneNum(row, phoneNumCol) {
        const cell = row.getCell(phoneNumCol);

        return this.#cellService.getPhoneNum(cell);
    }

    //REFACTOR: 함수가 너무 길어서 이해하기 힘듬
    async extractRoundExams(worksheet, courseId) {
        const indexRow = this.#getIndexRow(worksheet);
        const commonRoundRow = this.#getCommonRoundRow(worksheet);
        let roundExams = new Array();
        let curRound = 0;
        let curCommonRound = 0;
        

        for (let colNum = 1; colNum <= indexRow._cells.length; colNum++) {
            const cell = indexRow.getCell(colNum);
            // const cell = indexRow._cells[colNum];

            if(this.#cellService.isRoundIndexCell(cell)) {

                const round = this.#cellService.getRound(cell, curRound);
                const commonRound = this.#getCommonRound(commonRoundRow, curCommonRound, colNum);
                const examScores = await this.#getExamScores(worksheet, colNum, courseId);
                
                let exams = new Array();

                //REFACTOR: 여기 커먼라운드를 모르는ㄴ게 조을 거 같은데 total_exam_id를 따로 받ㄴ는게 좋을듯
                //ranking은 현재 쓰지 않지만 이전 버젼에 사용해 현재는 undefined를 통해 기본값을 사용
                examScores.forEach(examScore => {
                    exams.push(new Exam(round, commonRound, examScore.scores, 
                                        undefined, examScore.studentId, courseId));
                });

                roundExams.push(exams);

                curRound++;
                if(commonRound > 0) {
                    curCommonRound++;
                }
            }
        }
        
        return roundExams;
    }

    #getIndexRow(worksheet) {
        //TODO: 현재는 3번째 줄을 받아오는데 좀 더 범용성 있계?
        return worksheet.getRow(this.INDEX_ROW);
    }

    #getCommonRoundRow(worksheet) {
        return worksheet.getRow(this.COMMON_ROUND_ROW);
    }

    #getCommonRound(commonRoundRow, curCommonRound, colNum) {
        //엑셀 양식에 따라 공통회차를 적는 위치가 달라서 두 개를 다 체크한다.
        const oldCommonRound = this.#cellService.getCommonRound(commonRoundRow.getCell(colNum + 3), curCommonRound);
        const newCommonRound = this.#cellService.getCommonRound(commonRoundRow.getCell(colNum + 4), curCommonRound);

        return Math.max(oldCommonRound, newCommonRound);
    }
    
    async #getExamScores(worksheet, col, classId) {
        //한 행씩 아래로 내려가면서 이름 있는지 확인하고 -> 하나의 객체 만들어서 저장
        //끝나고 나서 합계 구하기
        const firstScoreCol = worksheet.getColumn(col);
        let examScores = new Array();

        for (let rowNum = 1; rowNum <= firstScoreCol.values.length; rowNum++) {
            const cell = worksheet.getRow(rowNum).getCell(col);
            if(this.#cellService.isScore(cell)) {
                
                const scoreCells = this.#getScoreCells(worksheet, rowNum, col);
                const scores = this.#cellService.getScores(scoreCells);

                const student = await this.#findStudent(worksheet, rowNum, classId);
                const studentId = student.id;

                examScores.push(new ExamScore(scores, studentId));
            }
        }

        return examScores;
    }

    #getScoreCells(worksheet, rowNum, colNum) {
        const firstScoreCell = worksheet.getRow(rowNum).getCell(colNum);
        const secondScoreCell = worksheet.getRow(rowNum).getCell(colNum + 1);
        const thirdScoreCell = worksheet.getRow(rowNum).getCell(colNum + 2);

        return [firstScoreCell, secondScoreCell, thirdScoreCell];
    }

    async #findStudent(worksheet, rowNum, courseId) {
        const indexRow = this.#getIndexRow(worksheet);
        const nameCol = this.#getNameCol(indexRow);
        const name = this.#getName(worksheet.getRow(rowNum), nameCol);
        
        const phoneNumCol = this.#getPhoneNumCol(indexRow);
        const phoneNum = this.#getPhoneNum(worksheet.getRow(rowNum), phoneNumCol);
        const student = await this.#findOneByStudentInfo(name, phoneNum, courseId);

        if(student === null) {
            throw new SyntaxError(ExcelErrorMsg.NO_EXISTENT_STUDENT);
        }

        //TODO: 여기 뒤에 2개 안 넣어도 되려나
        return student;
    }

    async #findOneByStudentInfo(name, phoneNum, courseId) {
        let student = null;

        if (phoneNum != '') {
            let student = await this.#studentRepository.findOneByPhoneNumAndCourseId(phoneNum, courseId);
        }
        
        if(student === null || (student.name != name)) {
            student = await this.#studentRepository.findOneByNameAndCourseId(name, courseId);
        }

        return student;
    }

    getScoreRule(worksheet) {
        const scoreRulesCol = worksheet.getColumn(1);
        let scoreRule = "";
        const that = this;

        scoreRulesCol.eachCell({includeEmpty : true}, function(cell) {            
            scoreRule += that.#cellService.getScoreRule(cell);
        });

        return scoreRule;
    }

    async extractRoundDeptDatas(worksheet, courseId) {
        const indexRow = this.#getIndexRow(worksheet);
        let roundDeptDatas = new Array();
        let curCommonRound = 0;
        

        for (let colNum = 1; colNum <= indexRow._cells.length; colNum++) {
            const cell = indexRow.getCell(colNum);
            // const cell = indexRow._cells[colNum];

            if(this.#cellService.isDeptRoundCell(cell, curCommonRound)) {

                const commonRound = this.#cellService.getDeptCommonRound(cell, curCommonRound);
                const studentDepts = await this.#getStudentDepts(worksheet, colNum, courseId, commonRound);
                let roundDeptData = new Array();

                studentDepts.forEach(studentDept => {
                    roundDeptData.push(studentDept);
                });

                roundDeptDatas.push(roundDeptData);
                
                curCommonRound++;
            }
        }
        
        return roundDeptDatas;
    }

    async #getStudentDepts(worksheet, col, courseId, commonRound) {
        //한 행씩 아래로 내려가면서 이름 있는지 확인하고 -> 하나의 객체 만들어서 저장
        //끝나고 나서 합계 구하기
        let studentDepts = new Array();

        const seoulDeptCol = worksheet.getColumn(col);

        for (let rowNum = 1; rowNum <= seoulDeptCol.values.length; rowNum++) {
            const seoulDeptCell = worksheet.getRow(rowNum).getCell(col);
            const yonseiDeptCell = worksheet.getRow(rowNum).getCell(col + 1);

            const seoulDept = this.#cellService.getStudentDept(seoulDeptCell);
            const yonseiDept = this.#cellService.getStudentDept(yonseiDeptCell);

            let student;
            try {
                student = await this.#findStudent(worksheet, rowNum, courseId);
            } catch (error) {
                console.log(error.message);
            }

            if(student) {
                if (seoulDept || yonseiDept) {
                    studentDepts.push(new StudentDept(student.id, seoulDept, yonseiDept, commonRound))
                }
            }
        }

        return studentDepts;
    }
}

container.register({
    worksheetService : asClass(WorksheetService)
})