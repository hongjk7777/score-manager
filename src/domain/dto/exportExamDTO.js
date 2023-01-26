export default class ExportExamDTO {
    index;
    courseName;
    studentName;
    phoneNum;
    firstScore;
    secondScore;
    thirdScore;
    scoreSum;
    ranking;
    seoulDept;
    yonseiDept;

    constructor(index, firstScore, secondScore, thirdScore, scoreSum, 
            ranking = 0, studentName, courseName, seoulDept, yonseiDept, phoneNum) {
        this.index = index;
        this.firstScore = firstScore;
        this.secondScore = secondScore;
        this.thirdScore = thirdScore;
        this.scoreSum = scoreSum;
        this.ranking = ranking;
        this.studentName = studentName;
        this.courseName = courseName;
        this.seoulDept = seoulDept;
        this.yonseiDept = yonseiDept;
        this.phoneNum = phoneNum;
    }
}