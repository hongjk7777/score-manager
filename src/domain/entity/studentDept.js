export default class StudentDept {
    studentId;
    seoulDept;
    yonseiDept;
    commonRound;

    constructor (studentId, seoulDept, yonseiDept, commonRound) {
        this.studentId = studentId;
        this.seoulDept = seoulDept;
        this.yonseiDept = yonseiDept;
        this.commonRound = commonRound;
    }
}