import CellService from "../../src/excel/cellService"
import ExcelErrorMsg from "../../src/validator/excelErrorMsg";

const cellService = new CellService();

describe('isRoundCell 테스트', () => {
    test('한 자릿수 정상 테스트', () => {
        const testCell = {'value' : '1회'};
        
        expect(cellService.isRoundCell(testCell)).toBe(true);
    })

    test('두 자릿수 정상 테스트', () => {
        const testCell = {'value' : '12회'};
        
        expect(cellService.isRoundCell(testCell)).toBe(true);
    })

    test('비정상 테스트', () => {
        const testCell = {'value' : '1화'};
        const testCell2 = {'value' : '114511'};
        
        expect(cellService.isRoundCell(testCell)).toBe(false);
        expect(cellService.isRoundCell(testCell2)).toBe(false);
    })
})

describe('getRound 테스트', () => {
    test('한 자릿수 정상 테스트', () => {
        const curRound = 1;
        const testCell = {'value' : `${curRound}회`};
        
        expect(cellService.getRound(testCell, curRound - 1)).toBe(1);
    })

    test('두 자릿수 정상 테스트', () => {
        const curRound = 12;
        const testCell = {'value' : `${curRound}회`};
        
        expect(cellService.getRound(testCell, curRound - 1)).toBe(12);
    })

    test('세 자릿수 정상 테스트', () => {
        const curRound = 123;
        const testCell = {'value' : `${curRound}회`};
        
        expect(cellService.getRound(testCell, curRound - 1)).toBe(123);
    })

    test('숫자가 없을 경우 비정상 테스트', () => {
        const curRound = 123;
        const testCell = {'value' : ``};;
        
        expect(() => cellService.getRound(testCell, curRound - 1))
                        .toThrow(new SyntaxError(ExcelErrorMsg.INCORRECT_EXAM_ROUND_INDEX));
    })
})

describe('getCommonRound 테스트', () => {
    test('한 자릿수 정상 테스트', () => {
        const curRound = 1;
        const testCell = {'value' : `공통${curRound}`};
        
        expect(cellService.getCommonRound(testCell, curRound - 1)).toBe(1);
    })

    test('두 자릿수 정상 테스트', () => {
        const curRound = 12;
        const testCell = {'value' : `공통${curRound}`};
        
        expect(cellService.getCommonRound(testCell, curRound - 1)).toBe(12);
    })

    test('세 자릿수 정상 테스트', () => {
        const curRound = 123;
        const testCell = {'value' : `공통${curRound}`};
        
        expect(cellService.getCommonRound(testCell, curRound - 1)).toBe(123);
    })

    test('비어있을 때 정상 테스트', () => {
        const curRound = 0;
        const testCell = {};
        
        expect(cellService.getCommonRound(testCell, curRound - 1)).toBe(-1);
    })

    test('띄어쓰기 있을 경우 정상 테스트', () => {
        const curRound = 123;
        const testCell = {'value' : `공통 ${curRound}`};
        
        expect(cellService.getCommonRound(testCell, curRound - 1)).toBe(123);
    })

    test('앞 뒤글자를 바꿨을 때 정상 테스트', () => {
        const curRound = 123;
        const testCell = {'value' : `공통 ${curRound}회`};
        
        expect(cellService.getCommonRound(testCell, curRound - 1)).toBe(123);
    })

    test('현재 회차가 전회차 + 1이 아닐 경ㅇ우 비정상 테스트', () => {
        const curRound = 123;
        const testCell = {'value' : `공통 ${curRound}회`};

        expect(() => cellService.getCommonRound(testCell, curRound - 2))
                        .toThrow(new SyntaxError(ExcelErrorMsg.INCORRECT_COMMON_ROUND_INDEX));

        expect(() => cellService.getCommonRound(testCell, curRound))
                        .toThrow(new SyntaxError(ExcelErrorMsg.INCORRECT_COMMON_ROUND_INDEX));
                    
        expect(() => cellService.getCommonRound(testCell, curRound + 1))
                        .toThrow(new SyntaxError(ExcelErrorMsg.INCORRECT_COMMON_ROUND_INDEX));
    })
})

describe('isScore 테스트', () => {
    test('한 자릿수 정상 테스트', () => {
        const testCell = {'value' : `1`};
        
        expect(cellService.isScore(testCell)).toBe(true);
    })

    test('두 자릿수 정상 테스트', () => {
        const testCell = {'value' : `12`};
        
        expect(cellService.isScore(testCell)).toBe(true);
    })

    test('세 자릿수 정상 테스트', () => {
        const testCell = {'value' : `123`};
        
        expect(cellService.isScore(testCell)).toBe(true);
    })

    test('띄어쓰기 있을 경우 정상 테스트', () => {
        const testCell = {'value' : `1 2 3  `};
        
        expect(cellService.isScore(testCell)).toBe(true);
    })

    test('비어있을 경우 정상 테스트', () => {
        const testCell = {'value' : ``}
        
        expect(cellService.isScore(testCell)).toBe(false);
    })

    test('점수 칸이 숫자가 아닌 값이 있을 경우 비정상 테스트', () => {
        const testCell = {'value' : `공통 12회`}

        expect(() => cellService.isScore(testCell))
                        .toThrow(new SyntaxError(ExcelErrorMsg.INCORRECT_EXAM_SCORE));
    })
})

describe('getScores 테스트', () => {
    test('한 자릿수 정상 테스트', () => {
        const testCells = [{'value' : `1`}, {'value' : `1`}, {'value' : `1`}];
        const correctScores = [1, 1, 1];

        expect(cellService.getScores(testCells)).toEqual(correctScores);
    })

    test('두 자릿수 정상 테스트', () => {
        const testCells = [{'value' : `12`}, {'value' : `12`}, {'value' : `12`}];
        const correctScores = [12, 12, 12];
        
        expect(cellService.getScores(testCells)).toEqual(correctScores);
    })

    test('세 자릿수 정상 테스트', () => {
        const testCells = [{'value' : `123`}, {'value' : `123`}, {'value' : `123`}];
        const correctScores = [123, 123, 123];
        
        expect(cellService.getScores(testCells)).toEqual(correctScores);
    })

    test('띄어쓰기 있을 경우 정상 테스트', () => {
        const testCells = [{'value' : `1 2`}, {'value' : `12 `}, {'value' : ` 1 2 `}];
        const correctScores = [12, 12, 12];
        
        expect(cellService.getScores(testCells)).toEqual(correctScores);
    })

    test('비어있을 경우 정상 테스트', () => {
        const testCells = [{'value' : `1 2`}, {'value' : `12 `}, {}];
        const correctScores = [12, 12, 0];
        
        expect(cellService.getScores(testCells)).toEqual(correctScores);
    })

    test('점수 칸에 숫자가 아닌 값이 있을 경우 비정상 테스트', () => {
        const testCells = [{'value' : `1 2`}, {'value' : `12 `}, {'value' : `잘못된 점수`}];

        expect(() => cellService.getScores(testCells))
                        .toThrow(new SyntaxError(ExcelErrorMsg.INCORRECT_EXAM_SCORE));
    })
})

describe('getScoreRule 테스트', () => {

    test('폰트 없을 때 정상 테스트', () => {
        const scoreRule = '채점기준'
        const testCell = {'value' : scoreRule};

        expect(cellService.getScoreRule(testCell)).toBe(`${scoreRule}\n`);
    })

    test('폰트 있을 때 정상 테스트', () => {
        const scoreRule = '채점기준'
        const testCell = {
            'value' : {
                'richText' : [{
                    'text' : scoreRule
                },
                {
                    'text' : scoreRule
                }]
            }
        };

        expect(cellService.getScoreRule(testCell)).toBe(`${scoreRule}${scoreRule}\n`);
    })

    test('비어 있을 때 정상 테스트', () => {
        const testCell = {};

        expect(cellService.getScoreRule(testCell)).toBe('$\n');
    })
})