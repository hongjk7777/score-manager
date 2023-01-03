export default class TotalExam {
    round;
    commonRound;
    scoreRule;
    classId;
    totalTester;
    average;
    standardDeviation;
    maxScore;
    problemScores; //길이가 3인 배열

    constructor(round, commonRound, scoreRule, classId, totalTester, 
                average, standardDeviation, maxScore, problemScores) {
        this.round = round;
        this.commonRound = commonRound;
        this.scoreRule = scoreRule;
        this.classId = classId;
        this.totalTester = totalTester;
        this.average = average;
        this.standardDeviation = standardDeviation;
        this.maxScore = maxScore;
        this.problemScores = problemScores;
    }

    //TODO: score 가져올 때 객체니까 복사를 해서 return 하는 게 더 조아 보이는데 그러면 다 getter?
}