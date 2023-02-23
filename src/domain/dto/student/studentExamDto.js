export default class StudentExamDto {
    name;
    exam;
    seoulDeptInfo;
    yonseiDeptInfo;

    constructor (name, exam, seoulDeptInfo, yonseiDeptInfo) {
        this.name = name;
        this.exam = exam;
        this.seoulDeptInfo = seoulDeptInfo;
        this.yonseiDeptInfo = yonseiDeptInfo;
    }
}