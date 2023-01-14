export default class Student {
    id;
    name;
    phoneNum;
    classId;

    constructor(name, phoneNum, classId, id) {
        this.name = name;
        this.phoneNum = phoneNum;
        this.classId = classId;
        this.id = id;
    }
}