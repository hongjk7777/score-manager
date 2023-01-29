import CellService from "../../src/excel/cellService"
import ExcelErrorMsg from "../../src/validator/excelErrorMsg";

const cellService = new CellService();

describe('isRoundIndexCell 테스트', () => {
    test('한 자릿수 정상 테스트', () => {
        const testCell = {'value' : '1회(1)'};
        
        expect(cellService.isRoundIndexCell(testCell)).toBe(true);
    })

    test('두 자릿수 정상 테스트', () => {
        const testCell = {'value' : '12회(1)'};
        
        expect(cellService.isRoundIndexCell(testCell)).toBe(true);
    })

    test('회차 index가 아닐 경우 테스트', () => {
        const testCell = {'value' : '1회'};
        const testCell2 = {'value' : '114511'};
        
        expect(cellService.isRoundIndexCell(testCell)).toBe(false);
        expect(cellService.isRoundIndexCell(testCell2)).toBe(false);
    })
})

describe('isNameIndexCell 테스트', () => {
    test('띄어쓰기 없는 정상 테스트', () => {
        const testCell = {'value' : '이름'};
        
        expect(cellService.isNameIndexCell(testCell)).toBe(true);
    })

    test('띄어쓰기 있는 정상 테스트', () => {
        const testCell = {'value' : ' 이름  '};
        
        expect(cellService.isNameIndexCell(testCell)).toBe(true);
    })

    test('이름 index가 아닐 경우 테스트', () => {
        const testCell = {'value' : '1회(1)'};
        const testCell2 = {'value' : '학부모전번'};
        
        expect(cellService.isNameIndexCell(testCell)).toBe(false);
        expect(cellService.isNameIndexCell(testCell2)).toBe(false);
    })
})

describe('isPhoneNumIndexCell 테스트', () => {
    test('띄어쓰기가 없는 경우 정상 테스트', () => {
        const testCell = {'value' : '학부모전번'};
        
        expect(cellService.isPhoneNumIndexCell(testCell)).toBe(true);
    })

    test('띄어쓰기가 있는 경우 정상 테스트', () => {
        const testCell = {'value' : '학부모 전번'};
        
        expect(cellService.isPhoneNumIndexCell(testCell)).toBe(true);
    })

    test('학부모만 있는 경우 정상 테스트', () => {
        const testCell = {'value' : '학부모'};
        
        expect(cellService.isPhoneNumIndexCell(testCell)).toBe(true);
    })

    test('전번만 있는 경우 정상 테스트', () => {
        const testCell = {'value' : '전번'};
        
        expect(cellService.isPhoneNumIndexCell(testCell)).toBe(true);
    })

    test('전화번호 index가 아닐 경우 테스트', () => {
        const testCell = {'value' : '1회(1)'};
        const testCell2 = {'value' : '이름'};
        
        expect(cellService.isPhoneNumIndexCell(testCell)).toBe(false);
        expect(cellService.isPhoneNumIndexCell(testCell2)).toBe(false);
    })
})

describe('isStudentNumIndexCell 테스트', () => {
    test('띄어쓰기 없는 정상 테스트', () => {
        const testCell = {'value' : '순번'};
        
        expect(cellService.isStudentNumIndexCell(testCell)).toBe(true);
    })

    test('띄어쓰기 있는 정상 테스트', () => {
        const testCell = {'value' : ' 순번  '};
        
        expect(cellService.isStudentNumIndexCell(testCell)).toBe(true);
    })

    test('순번 index가 아닐 경우 테스트', () => {
        const testCell = {'value' : '1회(1)'};
        const testCell2 = {'value' : '학부모전번'};
        
        expect(cellService.isStudentNumIndexCell(testCell)).toBe(false);
        expect(cellService.isStudentNumIndexCell(testCell2)).toBe(false);
    })
})

describe('getPhoneNum 테스트', () => {
    test('정수 정상 테스트', () => {
        const testPhoneNum = 1012345678;
        const testCell = {'value' : testPhoneNum};
        
        expect(cellService.getPhoneNum(testCell)).toBe('0' + testPhoneNum);
    })

    test('띄어쓰기 없는 문자열 정상 테스트', () => {
        const testPhoneNum = '01012345678';
        const testCell = {'value' : testPhoneNum};
        
        expect(cellService.getPhoneNum(testCell)).toBe(testPhoneNum);
    })

    test('띄어쓰기 있는 문자열 정상 테스트', () => {
        const testPhoneNum = ' 01 012345678   ';
        const testCell = {'value' : testPhoneNum};
        
        expect(cellService.getPhoneNum(testCell)).toBe(testPhoneNum.replaceAll(' ', ''));
    })

    test('숫자가 아닌 문자 있을 경우 테스트', () => {
        const testPhoneNum = '01012345678-';
        const testCell = {'value' : testPhoneNum};
        
        expect(cellService.getPhoneNum(testCell)).toBe(testPhoneNum.replace('-', ''));
    })

    test('값이 없을 경우 테스트', () => {
        const testCell = {'value' : undefined};
        
        expect(cellService.getPhoneNum(testCell)).toBe('');
    })
})

describe('isStudentNumCell 테스트', () => {
    test('정수 정상 테스트', () => {
        const testCell = {'value' : 1};
        
        expect(cellService.isStudentNumCell(testCell)).toBe(true);
    })

    test('띄어쓰기 없는 문자열 정상 테스트', () => {
        const testCell = {'value' : '1'};
        
        expect(cellService.isStudentNumCell(testCell)).toBe(true);
    })

    test('띄어쓰기 있는 문자열 정상 테스트', () => {
        const testCell = {'value' : ' 12  '};
        
        expect(cellService.isStudentNumCell(testCell)).toBe(true);
    })

    test('학생 순번이 아닐 경우 테스트', () => {
        const testCell = {'value' : '1회(1)'};
        const testCell2 = {'value' : '학부모전번'};
        
        expect(cellService.isStudentNumCell(testCell)).toBe(false);
        expect(cellService.isStudentNumCell(testCell2)).toBe(false);
    })
})

describe('isStudentNameCell 테스트', () => {
    test('띄어쓰기 없는 정상 테스트', () => {
        const testCell = {'value' : '학생1'};
        
        expect(cellService.isStudentNameCell(testCell)).toBe(true);
    })

    test('띄어쓰기 있는 정상 테스트', () => {
        const testCell = {'value' : ' 학생2  '};
        
        expect(cellService.isStudentNameCell(testCell)).toBe(true);
    })

    test('학생 이름이 아닐 거나 비어 있을 경우 테스트', () => {
        const testCell = {'value' : '이름'};
        const testCell2 = {'value' : ''};
        
        expect(cellService.isStudentNameCell(testCell)).toBe(false);
        expect(cellService.isStudentNameCell(testCell2)).toBe(false);
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
        
        expect(cellService.getCommonRound(testCell, curRound - 1)).toBe(0);
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
    test('한 자릿수 정수 정상 테스트', () => {
        const testCell = {'value' : 1};
        
        expect(cellService.isScore(testCell)).toBe(true);
    })

    test('두 자릿수 정수 정상 테스트', () => {
        const testCell = {'value' : 12};
        
        expect(cellService.isScore(testCell)).toBe(true);
    })

    test('세 자릿수 정수 정상 테스트', () => {
        const testCell = {'value' : 123};
        
        expect(cellService.isScore(testCell)).toBe(true);
    })

    test('한 자릿수 문자열 실패 테스트', () => {
        const testCell = {'value' : `1`};
        
        expect(cellService.isScore(testCell)).toBe(false);
    })

    test('두 자릿수 문자열 실패 테스트', () => {
        const testCell = {'value' : `12`};
        
        expect(cellService.isScore(testCell)).toBe(false);
    })

    test('세 자릿수 문자열 실패 테스트', () => {
        const testCell = {'value' : `123`};
        
        expect(cellService.isScore(testCell)).toBe(false);
    })

    test('띄어쓰기 있을 경우 실패 테스트', () => {
        const testCell = {'value' : `  123  `};
        
        expect(cellService.isScore(testCell)).toBe(false);
    })

    test('비어있을 경우 정상 테스트', () => {
        const testCell = {'value' : ``}
        
        expect(cellService.isScore(testCell)).toBe(false);
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

describe('isDeptRoundCell 테스트', () => {
    test('한 자릿수 정수일 경우 정상 테스트', () => {
        const testCell = {'value': 1}
        const prevCommonRound = 0;

        expect(cellService.isDeptRoundCell(testCell, prevCommonRound)).toBe(true);
    })

    test('두 자릿수 정수일 경우 정상 테스트', () => {
        const testCell = {'value': 12}
        const prevCommonRound = 11;

        expect(cellService.isDeptRoundCell(testCell, prevCommonRound)).toBe(true);
    })

    test('한 자릿수 문자열일 경우 정상 테스트', () => {
        const testCell = {'value': '1'}
        const prevCommonRound = 0;

        expect(cellService.isDeptRoundCell(testCell, prevCommonRound)).toBe(true);
    })

    test('두 자릿수 문자열일 경우 정상 테스트', () => {
        const testCell = {'value': '12'}
        const prevCommonRound = 11;

        expect(cellService.isDeptRoundCell(testCell, prevCommonRound)).toBe(true);
    })

    test('다른 문자열과 섞여 있을 경우 정상 테스트', () => {
        const testCell = {'value': '$$$13'}
        const prevCommonRound = 12;

        expect(cellService.isDeptRoundCell(testCell, prevCommonRound)).toBe(true);
    })

    test('숫자가 들어있지 않을 경우 실패 테스트', () => {
        const testCell = {'value': '$$$'}
        const prevCommonRound = 0;

        expect(cellService.isDeptRoundCell(testCell, prevCommonRound)).toBe(false);
    })
})

describe('getDeptCommonRound 테스트', () => {
    test('한 자릿수 정수일 경우 정상 테스트', () => {
        const testCell = {'value': 1}
        const prevCommonRound = 0;

        expect(cellService.getDeptCommonRound(testCell, prevCommonRound)).toBe(1);
    })

    test('두 자릿수 정수일 경우 정상 테스트', () => {
        const testCell = {'value': 12}
        const prevCommonRound = 11;

        expect(cellService.getDeptCommonRound(testCell, prevCommonRound)).toBe(12);
    })

    test('한 자릿수 문자열일 경우 정상 테스트', () => {
        const testCell = {'value': '1'}
        const prevCommonRound = 0;

        expect(cellService.getDeptCommonRound(testCell, prevCommonRound)).toBe(1);
    })

    test('두 자릿수 문자열일 경우 정상 테스트', () => {
        const testCell = {'value': '12'}
        const prevCommonRound = 11;

        expect(cellService.getDeptCommonRound(testCell, prevCommonRound)).toBe(12);
    })

    test('다른 문자열과 섞여 있을 경우 정상 테스트', () => {
        const testCell = {'value': '$$$13'}
        const prevCommonRound = 12;

        expect(cellService.getDeptCommonRound(testCell, prevCommonRound)).toBe(13);
    })

    test('숫자가 들어있지 않을 경우 실패 테스트', () => {
        const testCell = {'value': '$$$'}
        const prevCommonRound = 0;

        expect(() => cellService.getDeptCommonRound(testCell, prevCommonRound))
                .toThrow(new SyntaxError(ExcelErrorMsg.INCORRECT_DEPT_ROUND));
    })

    test('비어 있을 경우 실패 테스트', () => {
        const testCell = {}
        const prevCommonRound = 0;

        expect(() => cellService.getDeptCommonRound(testCell, prevCommonRound))
                .toThrow(new SyntaxError(ExcelErrorMsg.INCORRECT_DEPT_ROUND));
    })
})

describe('getStudentDept 테스트', () => {
    test('문자열 정상 테스트', () => {
        const testCell = {'value': '화학과'}

        expect(cellService.getStudentDept(testCell)).toBe(testCell.value);
    })

    test('비어있을 경우 테스트', () => {
        const testCell = {}

        expect(cellService.getStudentDept(testCell)).toBe(null);
    })
})