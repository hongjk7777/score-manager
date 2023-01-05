import Student from "../model/student";
import ExcelErrorMsg from "../validator/excelErrorMsg";
import WorksheetService from "./worksheetService";

export default class CellService {
    isRoundCell(cell) {
        if(cell.value) {
            return cell.value.includes('회'); 
        }

        return false;
    }

    getRound(cell, curRound) {
        if(cell.value) {
            const roundStr = cell.value.split('회', 1)[0];
            const regex = /[^0-9]/g;
            const result = roundStr.replace(regex, "");
            const round = parseInt(result);

            if(!isNaN(round) && round == curRound + 1) {
                return round;
            }
        }

        throw SyntaxError(ExcelErrorMsg.INCORRECT_EXAM_ROUND_INDEX);
    }

    getCommonRound(cell, curCommonRound) {
        if(cell.value) {
            const str = cell.value;
            const regex = /[^0-9]/g;
            const result = str.replace(regex, "");
            const commonRound = parseInt(result);

            if(!isNaN(commonRound)) {
                if(commonRound == curCommonRound + 1) {
                    return commonRound;
                }

                throw SyntaxError(ExcelErrorMsg.INCORRECT_COMMON_ROUND_INDEX);
            }
        }

        return -1;

    }

    isScore(cell) {
        if(cell.value) {
            const score = parseInt(cell.value);

            //TODO: 그냥 비어있을 때도 저 에러 뜨는지 확인해 봐야 함 그냥 비어 있을수도 있음
            if(!isNaN(score) && !(cell.value.includes('회'))) {
                throw SyntaxError(score + ExcelErrorMsg.INCORRECT_EXAM_ROUND_INDEX);
            }   

            return true;
        }

        return false;
    }

    getScores(worksheet, row, startCol) {
        let scores = new Array();

        //TODO: 예외 처리
        const firstScore = this.#getScore(worksheet, row, startCol);
        const secondScore = this.#getScore(worksheet, row, startCol + 1);
        const thirdScore = this.#getScore(worksheet, row, startCol + 2);

        scores.push(firstScore);
        scores.push(secondScore);
        scores.push(thirdScore);
        
        return scores;
    }

    #getScore(worksheet, row, col) {
        const scoreCell = worksheet.getCol(startCol).getCell(row);

        if (scoreCell) {
            return scoreCell.value;
        }
        
        return null;
    }

    getStudent(worksheet, row) {
        //TODO: 이거 비효율
        const name = this.#getName(worksheet, row);
        const phoneNum = this.#getPhoneNum();

        //TODO: 여기 뒤에 2개 안 넣어도 되려나
        return new Student(name, phoneNum);
    }

    #getName(worksheet, row) {
        const nameCol = this.#getNameCol(worksheet);
        const nameCell = worksheet.getCol(nameCol).getCell(row);
        
        if(nameCell) {
            return nameCell.value;
        }

        return null;
    }

    #getNameCol(worksheet) {
        const indexRow = worksheet.getRow(WorksheetService.indexRow);
        let nameCol = -1;

        indexRow.eachCell((cell, col) => {
            if(cell.value && cell.value.includes("이름")) {
                nameCol = col;
                return;
            }
        });

        if(nameCol < 0) {
            throw SyntaxError(ExcelErrorMsg.NO_STUDENT_NAME_COL);
        }

        return nameCol;
    }

    #getPhoneNum(worksheet, row) {
        const phoneNumCol = this.#getPhoneNumCol(worksheet);
        const phoneNumCell = worksheet.getCol(phoneNumCol).getCell(row);

        if(phoneNumCell) {
            return phoneNumCell.value;
        }

        return null;
    }

    #getPhoneNumCol(worksheet) {
        const indexRow = worksheet.getRow(WorksheetService.indexRow);
        let phoneNumCol = -1;

        indexRow.eachCell((cell, col) => {
            if(cell.value && cell.value.includes("학부모")) {
                phoneNumCol = col;
                return;
            }
        });

        if(phoneNumCol < 0) {
            throw SyntaxError(ExcelErrorMsg.NO_PHONE_NUM_COL);
        }

        return phoneNumCol;
    }
}