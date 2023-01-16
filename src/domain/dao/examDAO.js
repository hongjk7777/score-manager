export default class ExamDAO {
    index;
    scores;
    scoreSum;
    ranking;
    studentName;
    courseName;
    seoulDept;
    yonseiDept;
    phoneNum;

    constructor(index, scores, ranking = 0, studentName, 
                courseName, seoulDept, yonseiDept, phoneNum) {
        this.index = index;
        this.scores = scores;
        this.scoreSum = this.#getScoreSum(scores);
        this.ranking = ranking;
        this.studentName = studentName;
        this.courseName = courseName;
        this.seoulDept = seoulDept;
        this.yonseiDept = yonseiDept;
        this.phoneNum = phoneNum;
    }

    #getScoreSum(scores) {
        return scores[0] + scores[1] + scores[2];
    }

}