import { Workbook } from "exceljs";
import ExcelErrorMsg from "../validator/excelErrorMsg";

//TODO: cell에서 하는 작업음 cellService로 분리하는 게 더 나을 듯?
export default class WorksheetService {

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

        return excel.worksheets[worksheetId];
    }

    handleExamDatas(worksheet, classId) {
        const roundRows = this.#getRoundRow(worksheet);
        const roundSize = this.#getRoundSize(worksheet);
        let curRound = 1;

        roundRows.eachCell((cell, col) => {
            if(this.#isRoundCell(cell)) {
                const round = this.#getRound(cell, curRound);

                this.#saveExamsDatas(worksheet, round, col);
                curRound++;
            }
        }); 
    }

    #getRoundRow(worksheet) {
        //TODO: 현재는 3번째 줄을 받아오는데 좀 더 범용성 있계?
        return worksheet.getRow(2);
    }

    #isRoundCell(cell) {
        if(cell.value) {
            return cell.value.includes('회'); 
        }

        return false;
    }

    #getRound(cell, curRound) {
        if(cell.value) {
            const roundStr = cell.value.split('회', 1)[0];
            const regex = /[^0-9]/g;
            const result = roundStr.replace(regex, "");
            const round = parseInt(result);

            if(!isNaN(round) && round == curRound + 1) {
                return round;
            }
        }

        throw SyntaxError(ExcelErrorMsg.NO_EXAM_ROUND_INDEX);
    }
    
    #saveExamsDatas(worksheet, round, col) {
        //한 행씩 아래로 내려가면서 이름 있는지 확인하고 -> 하나의 객체 만들어서 저장
        //끝나고 나서 합계 구하기
        const firstScoreCol = worksheet.getCol(col);

        firstScoreCol.eachCell((cell, row) => {
            if(this.#isScore(cell)) {
                const scores = this.#getScores(worksheet, col);
                this.#saveStudentsDatas(scores);
            }
        });
    }

    #isScore(cell) {
        if(cell.value) {
            const score = parseInt(cell.value);

            //TODO: 그냥 비어있을 때도 저 에러 뜨는지 확인해 봐야 함 그냥 비어 있을수도 있음
            if(!isNaN(score) && !(cell.value.includes('회'))) {
                throw SyntaxError(score + ExcelErrorMsg.NO_EXAM_ROUND_INDEX);
            }   

            return true;
        }

        return false;
    }

    #getScores(worksheet, col) {
        return new Array();
    }

    #saveStudentsDatas(cell, round, col) {
        let scores = new Array();

        for (let i = 0; i < 3; i++) {
            scores.push(this.#getScore(i));
        }
    }
}