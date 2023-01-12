import ExcelErrorMsg from "../validator/excelErrorMsg";

export default class CellService {

    isRoundIndexCell(cell) {
        if(cell.value && (typeof cell.value === 'string')) {
            return cell.value.includes('회') && cell.value.includes('(1)'); 
        }

        return false;
    }

    isNameIndexCell(cell) {
        if(cell.value && (typeof cell.value === 'string')) {
            return cell.value.includes('이름'); 
        }

        return false;
    }

    isPhoneNumIndexCell(cell) {
        if(cell.value && (typeof cell.value === 'string')) {
            return cell.value.includes('학부모') || cell.value.includes('전번'); 
        }

        return false;
    }

    isStudentNumIndexCell(cell) {
        if(cell.value && (typeof cell.value === 'string')) {
            return cell.value.includes('순번'); 
        }

        return false;
    }

    isStudentNumCell(cell) {
        if(cell.value) {
            if(typeof cell.value === 'number') {
                return true;
            } else if(typeof cell.value === 'string') {
                return !isNaN(cell.value);
            }
        }

        return false;
    }

    getPhoneNum(cell) {
        let value = cell.value;

        if(value) {
            if(typeof value === 'number') {
                value = '0' + value;
            }
            return this.#parseOnlyNumber(value);
        }

        return '';
    }

    #parseOnlyNumber(str) {
        const regex = /[^0-9]/g;
        const result = str.replace(regex, "");

        return result;
    }

    isStudentNameCell(cell) {
        if(cell.value) {
            const name = cell.value.replaceAll(' ', '');
            
            if(name == '' || name == '이름') {
                return false;
            }

            return true;
        }

        return false;
    }

    getRound(cell, curRound) {
        if(cell.value) {
            const roundStr = cell.value.split('회', 1)[0];
            const round = this.#parseIntWithoutStr(roundStr);
            if(!isNaN(round) && round == curRound + 1) {
                return round;
            }
        }

        throw new SyntaxError(ExcelErrorMsg.INCORRECT_EXAM_ROUND_INDEX);
    }

    #parseIntWithoutStr(str) {
        const regex = /[^0-9]/g;
        const result = str.replace(regex, "");
        const value = parseInt(result);

        return value;
    }

    getCommonRound(cell, curCommonRound) {
        if(cell.value) {
            const commonRound = this.#parseIntWithoutStr(cell.value);

            if(!isNaN(commonRound)) {
                if(commonRound == curCommonRound + 1) {
                    return commonRound;
                }

                throw new SyntaxError(ExcelErrorMsg.INCORRECT_COMMON_ROUND_INDEX);
            }
        }

        return 0;
    }

    isScore(cell) {
        if(cell.value && (typeof cell.value === 'number')) {
            const score = cell.value;
            if(isNaN(score)) {
                throw new SyntaxError(ExcelErrorMsg.INCORRECT_EXAM_SCORE);
            }   

            return true;
        }

        return false;
    }

    getScores(scoreCells) {
        const scores = new Array();
        
        scoreCells.forEach((scoreCell) => {
            const score = this.#getScore(scoreCell);
            scores.push(score);
        })
        
        return scores;
    }

    #getScore(scoreCell) {        
        if (scoreCell.value) {
            let score = 0; 

            if(typeof scoreCell.value === 'number') {
                score = scoreCell.value;
            } else if(typeof scoreCell.value === 'string') {
                score = this.#parseIntWithoutStr(scoreCell.value);
            }
            
            if(isNaN(score)) {
                throw new SyntaxError(ExcelErrorMsg.INCORRECT_EXAM_SCORE);
            }

            return score;
        }
        
        return 0;
    }

    getScoreRule(cell) {
        let scoreRule = '';

        if(cell.value){
            //cell 내부에서 font가 다른 경우 richText로 나눠져서 해당 처리를 함
            if(cell.value.richText){
                cell.value.richText.forEach(obj => {
                    scoreRule += obj.text;
                });
                
            } else{
                scoreRule += cell.value;
            }
            scoreRule += "\n";

        } else{
            scoreRule += "$";
            scoreRule += "\n";
        }

        return scoreRule;
    }

    isDeptRoundCell(cell, curCommonRound) {
        if(cell.value) {
            let round = 0;
            if(typeof cell.value === 'number') {
                return cell.value === curCommonRound + 1;
            } else if(typeof cell.value === 'string') {
                round = this.#parseIntWithoutStr(cell.value);

                return !isNaN(round) && (round === curCommonRound + 1);
            }
        }

        return false;
    }

    getDeptCommonRound(cell, prevCommonRound) {
        if(cell.value) {
            let commonRound = 0;

            if(typeof cell.value === 'string') {
                commonRound = this.#parseIntWithoutStr(cell.value);
            } else if(typeof cell.value === 'number') {
                commonRound = cell.value;
            }

            if(commonRound != prevCommonRound + 1) {
                throw new SyntaxError(ExcelErrorMsg.INCORRECT_DEPT_ROUND);
            }

            return commonRound;
        }

        throw new SyntaxError(ExcelErrorMsg.INCORRECT_DEPT_ROUND);
    }

    getStudentDept(cell) {
        const value = cell.value;

        if (value && (typeof value === 'string')) {
            if(value.includes('과') || value.includes('부')) {
                return value;
            }
        }

        return null;
    }
}