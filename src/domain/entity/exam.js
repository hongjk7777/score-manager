export default class Exam {
    round;
    commonRound;
    scores;
    scoreSum;
    ranking;
    studentId;
    classId;
    seoulDept;
    yonseiDept;

    constructor(round, commonRound, scores, ranking = 0, 
                studentId, classId, seoulDept, yonseiDept) {
        this.round = round;
        this.commonRound = commonRound;
        this.scores = scores;
        this.scoreSum = this.#getScoreSum(scores);
        this.ranking = ranking;
        this.studentId = studentId;
        this.classId = classId;
        this.seoulDept = seoulDept;
        this.yonseiDept = yonseiDept;
    }

    #getScoreSum(scores) {
        return scores[0] + scores[1] + scores[2];
    }

    //TODO: score 가져올 때 객체니까 복사를 해서 return 하는 게 더 조아 보이는데 그러면 다 getter?
}