import ExcelErrorMsg from "../validator/excelErrorMsg";

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

        return -1;
    }

    isScore(cell) {
        if(cell.value) {
            const score = parseInt(cell.value);

            //TODO: 그냥 비어있을 때도 저 에러 뜨는지 확인해 봐야 함 그냥 비어 있을수도 있음
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

        console.log(scores);
        
        return scores;
    }

    #getScore(scoreCell) {        
        if (scoreCell.value) {
            const score = this.#parseIntWithoutStr(scoreCell.value);
            
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
}