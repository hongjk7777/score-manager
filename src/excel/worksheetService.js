import { Workbook } from "exceljs";
import StudentRepository from "../db/student/studentRepository";
import Exam from "../model/exam";
import ExamScore from "../model/examScore";
import ExcelErrorMsg from "../validator/excelErrorMsg";
import CellService from "./cellService";
import ExamService from "./examService";

//TODO: cell에서 하는 작업음 cellService로 분리하는 게 더 나을 듯?
export default class WorksheetService {    
    static indexRow = 2;
    static commonRoundRow = 1;

    #cellService = new CellService();
    #examService = new ExamService();
    #studentRepository = new StudentRepository();


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
            const phoneNum = this.#cellService.getPhoneNum(row, phoneNumCol);

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
            throw SyntaxError(ExcelErrorMsg.NO_STUDENT_NAME_COL);
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

    //REFACTOR: 함수가 너무 길어서 이해하기 힘듬
    extractRoundExams(worksheet, classId) {
        const roundIndexRows = this.#getRoundIndexRow(worksheet);
        const commonRoundRow = this.#getCommonRoundRow(worksheet);
        let roundExams = new Array();
        let curRound = 1;
        let curCommonRound = 1;

        roundIndexRows.eachCell((cell, col) => {
            if(this.#cellService.isRoundCell(cell)) {
                const round = this.#cellService.getRound(cell, curRound);
                const commonRound = this.#cellService.getCommonRound(commonRoundRow.getCell(col), curCommonRound);
                const examScores = this.#getExamScores(worksheet, col, classId);
                let exams = new Array();

                //REFACTOR: 여기 커먼라운드를 모르는ㄴ게 조을 거 같은데 total_exam_id를 따로 받ㄴ는게 좋을듯
                //ranking은 현재 쓰지 않지만 이전 버젼에 사용해 현재는 undefined를 통해 기본값을 사용
                examScores.forEach(examScore => {
                    exams.push(new Exam(round, commonRound, examScores.scores, 
                                        undefined, examScores.student.id, classId));
                });

                roundExams.push(exams);

                curRound++;
                if(commonRound > 0) {
                    curCommonRound++;
                }
            }
        }); 
        
        return roundExams;
    }

    #getRoundIndexRow(worksheet) {
        //TODO: 현재는 3번째 줄을 받아오는데 좀 더 범용성 있계?
        return worksheet.getRow(this.indexRow);
    }

    #getCommonRoundRow(worksheet) {
        return worksheet.getRow(this.commonRoundRow);
    }
    
    #getExamScores(worksheet, col, classId) {
        //한 행씩 아래로 내려가면서 이름 있는지 확인하고 -> 하나의 객체 만들어서 저장
        //끝나고 나서 합계 구하기
        const firstScoreCol = worksheet.getColumn(col);
        let examScores = new Array();

        firstScoreCol.eachCell((cell, row) => {
            if(this.#cellService.isScore(cell)) {
                const scoreCells = this.#getScoreCells(worksheet, row, col);
                const scores = this.#cellService.getScores(scoreCells);

                const student = this.#getStudent(worksheet, row, classId);

                examScores.push(new ExamScore(scores, student));
            }
        });

        return examScores;
    }

    #getScoreCells(worksheet, row, col) {
        const firstScoreCell = worksheet.getColumn(col).getCell(row);
        const secondScoreCell = worksheet.getColumn(col + 1).getCell(row);
        const thirdScoreCell = worksheet.getColumn(col + 2).getCell(row);

        return [firstScoreCell, secondScoreCell, thirdScoreCell];
    }

    async #findStudent(worksheet, rowNum, classId) {
        const indexRow = this.#getIndexRow(worksheet);
        const phoneNumCol = this.#getPhoneNumCol(indexRow);
        const phoneNumCell = worksheet.getRow(rowNum).getCell(phoneNumCol);
        const phoneNum = this.#cellService.getPhoneNum(phoneNumCell);
        const student = await this.#studentRepository.findOneByPhoneNum(phoneNum);

        if(student === null) {
            throw new SyntaxError(ExcelErrorMsg.NO_EXISTENT_STUDENT);
        }

        //TODO: 여기 뒤에 2개 안 넣어도 되려나
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
}