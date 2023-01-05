import { Workbook } from "exceljs";
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


    findWorksheetByName(name, excel) {
        let worksheetId = -1;

        excel.eachSheet((worksheet, id) => {
            console.log('워크싯 이름: ' + worksheet.name);
            if(worksheet.name.includes(name)) {
                worksheetId = id;
            }
        });

        if(worksheetId == -1) {
            return null;
        }

        return excel.getWorksheet(worksheetId);
    }

    //REFACTOR: round정보를 합쳐야 하나?
    handleExamDatas(worksheet, classId) {
        const roundIndexRows = this.#getRoundIndexRow(worksheet);
        const commonRoundRow = this.#getCommonRoundRow(worksheet);
        let examDatas = new Array();
        let curRound = 1;
        let curCommonRound = 1;

        roundIndexRows.eachCell((cell, col) => {
            if(this.#cellService.isRoundCell(cell)) {
                const round = this.#cellService.getRound(cell, curRound);
                const commonRound = this.#cellService.getCommonRound(commonRoundRow.getCell(col), curCommonRound);
                const examScores = this.#getExamScores(worksheet, col, classId);

                // examDatas.push(new Exam(round, commonRound, examScores.scores, undefined, examScores))

                curRound++;
                if(commonRound > 0) {
                    curCommonRound++;
                }
            }
        }); 

        // return 여기서 배열로 반환해야할듯
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
        const firstScoreCol = worksheet.getCol(col);
        let examScores = new Array();

        firstScoreCol.eachCell((cell, row) => {
            if(this.#cellService.isScore(cell)) {
                const scores = this.#cellService.getScores(worksheet, row, col);
                const student = this.#cellService.getStudent(worksheet, row, classId);
                examScores.push(new ExamScore(scores, student));
            }
        });

        return examScores;
    }
}