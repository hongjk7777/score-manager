export default class ExamScore {
    scores; // 길이가 3인 배열
    studentId;
    
    constructor(scores, studentId) {
        this.scores = scores;
        this.studentId = studentId;
    }
}