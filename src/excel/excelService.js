import ExcelJS from "exceljs";
import fs from "fs"
import ExamRepository from "../db/exam/examRepository";
import StudentRepository from "../db/student/studentRepository";
import TotalExamRepository from "../db/totalExam/totalExamRepository";
import TotalExam from "../model/totalExam";
import ExcelErrorMsg from "../validator/excelErrorMsg";
import WorksheetService from "./worksheetService";

export default class ExcelService {
    #examRepository = new ExamRepository();
    #totalExamRepository = new TotalExamRepository();
    #studentRepository = new StudentRepository();
    #worksheetService = new WorksheetService();


    async putExcelDatasToDB(file, courseId) {
        this.#initExcelDirectory(file);
    
        const excel = await this.#getExcel(file);
        const success = await this.deleteClassPrevDB(courseId);

        if(success) {
            const personalSheetName = '개인';
            const personalSheet = this.#worksheetService.findWorksheetByName(personalSheetName, excel);
            if (personalSheet == null) {
                throw new RangeError(ExcelErrorMsg.NO_PERSONAL_PAGE);
                //개인별 성적이 없을 경우 예외처리
            }

            const students = this.#worksheetService.extractStudents(personalSheet, courseId);
            this.#saveStudents(students);

            const roundExams = await this.#worksheetService.extractRoundExams(personalSheet, courseId);
            this.#saveRoundExams(excel, roundExams, courseId);
            //TODO: 아래 함수들 구현 요망
            const worksheet = excel.worksheets[0];
            //handleStudentDatas(worksheet, classId);
        }
        
    }

    #initExcelDirectory(file) {
        //이전에 사용했던 excel 파일을 지우고 다시 만든다.
        const excelsPath = "excels";
        this.#removeExcelsDirectory(excelsPath, file.filename);
        this.#makeExcelsDirectory(excelsPath);
    }

    #removeExcelsDirectory(path, inputFileName) {
        
        fs.readdirSync(path).forEach(file => {
            if(!(file === inputFileName)){
                try {
                    fs.unlinkSync(`${path}/${file}`)
                } catch (err) {
                    if(err.code == 'ENOENT'){
                        console.log("파일 삭제 Error 발생");
                    }
                }
            }
        });
    }

    #makeExcelsDirectory(path) {
        const directory = fs.existsSync(path);
        
        if(!directory){
            try {
                fs.mkdirSync(path);
            
                console.log(`excelFile is created!`);
            } catch (err) {
                console.error(`Error while creating excels directory.`);
            }
        }
    }

    async #getExcel(file) {
        const workbook = new ExcelJS.Workbook();
        const excel = await workbook.xlsx.readFile(file.path);
        return excel;
    }

    async deleteClassPrevDB(classId) {
        let success = false;

        success = await this.#examRepository.deleteByClassId(classId);
        success = await this.#studentRepository.deleteByCourseId(classId);
        success = await this.#totalExamRepository.deleteByClassId(classId);

        return success;
    }

    #saveRoundExams(excel, roundExams, classId) {
        roundExams.forEach((roundExam, round) => {
            this.#saveRoundExamInfo(excel, roundExam, round + 1, classId);
            this.#saveRoundExamData(roundExam);
        });
    }

    #saveRoundExamInfo(excel, roundExam, round, classId) {
        const commonRound = this.#getCommonRound(roundExam);
        const scoreRuleWorksheet = this.#worksheetService.findWorksheetByName(`테스트(${round})`, excel);
        const scoreRule = this.#worksheetService.getScoreRule(scoreRuleWorksheet);
        const problemScores = this.#parseProblemScore(scoreRule);
        const examInfo = this.#calculateExamInfo(roundExam);

        const totalExam = new TotalExam(round, commonRound, scoreRule, classId, examInfo.totalTester,
                    examInfo.average, examInfo.standardDev, examInfo.maxScore, problemScores)

        this.#totalExamRepository.save(totalExam);
    }

    #getCommonRound(roundExam) {
        if(roundExam.length > 0) {
            return roundExam[0].commonRound;
        }

        return -1;
    }

    #parseProblemScore(scoreRule) {

        return [0, 0, 0];
    }

    #calculateExamInfo(roundExam) {
        const scores = roundExam.map(exam => exam.scoreSum);
        const totalTester = scores.length;
        const average = (scores.reduce((partialSum, nextVal) => partialSum + nextVal) / totalTester)
                        .toFixed(2);
        const stdDev = Math.sqrt(scores.map(x => Math.pow(x - average, 2))
                                        .reduce((partialSum, nextVal) => partialSum + nextVal)
                                        / totalTester);
        const maxScore = Math.max.apply(null, scores);

        return new ExamInfo(totalTester, average, stdDev, maxScore);
    }

    #saveStudents(students) {
        students.forEach(student => {
            this.#studentRepository.save(student);    
        });
    }

    #saveRoundExamData(roundExam) {
        roundExam.forEach(exam => {
            this.#examRepository.save(exam);    
        });
    }

    async putDeptDatasToDB(file, courseId) {
        const excel = await this.#getExcel(file);
        const worksheet = excel.worksheets[0];

        const roundDeptDatas = await this.#worksheetService.extractRoundDeptDatas(worksheet, courseId);
        
        roundDeptDatas.forEach(roundDeptData => {
            this.#updateRoundDept(roundDeptData);
        });
    }

    #updateRoundDept(roundDeptData) {
        roundDeptData.forEach(studentDept => {
            this.#studentRepository.updateDepts(studentDept);
        });
    }
}

class ExamInfo {
    totalTester;
    average;
    standardDev;
    maxScore;

    constructor(totalTester, average, standardDev, maxScore) {
        this.totalTester = totalTester;
        this.average = average;
        this.standardDev = standardDev;
        this.maxScore = maxScore;
    }
}
