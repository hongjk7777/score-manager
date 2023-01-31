import ExcelJS from "exceljs";
import xlsx from "xlsx";
import fs from "fs"
import ExamRepository from "../domain/repository/examRepository";
import StudentRepository from "../domain/repository/studentRepository";
import TotalExamRepository from "../domain/repository/totalExamRepository";
import TotalExam from "../domain/entity/totalExam";
import ExamService from "../domain/service/examService";
import TotalExamService from "../domain/service/totalExamService";
import ExcelErrorMsg from "../validator/excelErrorMsg";
import WorksheetService from "./worksheetService";
import CourseService from "../domain/service/courseService";
import AuthService from "../auth/authService";
import container from "../container";
import { asClass } from "awilix";

const FILE_PATH = "src/excel/output/";
const FILE_NAME = "testExcel.xlsx";

export default class ExcelService {
    #worksheetService = container.resolve('worksheetService');
    #examService = container.resolve('examService');
    #totalExamService = container.resolve('totalExamService');
    #examRepository = container.resolve('examRepository');
    #totalExamRepository = container.resolve('totalExamRepository');
    #studentRepository = container.resolve('studentRepository');
    #courseService = container.resolve('courseService');
    #authService = container.resolve('authService');

    async putExcelDatasToDB(file, courseId) {
        this.#initExcelDirectory(file);
    
        const excel = await this.#getExcel(file);
        const success = await this.#courseService.deleteClassPrevDB(courseId);

        if(success) {
            const personalSheetName = '개인';
            const personalSheet = this.#worksheetService.findWorksheetByName(personalSheetName, excel);
            if (personalSheet == null) {
                throw new RangeError(ExcelErrorMsg.NO_PERSONAL_PAGE);
                //개인별 성적이 없을 경우 예외처리
            }

            const students = this.#worksheetService.extractStudents(personalSheet, courseId);
            let start = new Date();
            await this.#saveStudents(students);
            let end = new Date();

            console.log(end-start);

            const roundExams = await this.#worksheetService.extractRoundExams(personalSheet, courseId);

            await this.#saveRoundExams(excel, roundExams, courseId);
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

    async #saveRoundExams(excel, roundExams, classId) {
        const roundPromises = new Array();

        roundExams.forEach((roundExam, round) => {
            roundPromises.push(this.#saveRoundExamInfo(excel, roundExam, round + 1, classId));
            roundPromises.push(this.#saveRoundExamData(roundExam)); 
        });

        await Promise.all(roundPromises);
    }

    async #saveRoundExamInfo(excel, roundExam, round, classId) {
        const commonRound = this.#getCommonRound(roundExam);
        const scoreRuleWorksheet = this.#worksheetService.findWorksheetByName(`테스트(${round})`, excel);
        const scoreRule = this.#worksheetService.getScoreRule(scoreRuleWorksheet);
        const problemScores = this.#parseProblemScore(scoreRule);
        const examInfo = this.#calculateExamInfo(roundExam);
        
        const totalExam = new TotalExam(round, commonRound, scoreRule, classId, examInfo.totalTester,
                    examInfo.average, examInfo.standardDev, examInfo.maxScore, problemScores)

        await this.#totalExamRepository.save(totalExam);
    }

    #getCommonRound(roundExam) {
        if(roundExam.length > 0) {
            return roundExam[0].commonRound;
        }

        return 0;
    }

    #parseProblemScore(scoreRule) {

        return [0, 0, 0];
    }

    #calculateExamInfo(roundExam) {
        if(roundExam.length === 0) {
            //시험을 안 본 경우
            return new ExamInfo(0, 0, 0, 0);
        }

        const scores = roundExam.map(exam => exam.scoreSum);
        const totalTester = scores.length;
        const average = (scores.reduce((partialSum, nextVal) => partialSum + nextVal, 0) / totalTester)
                        .toFixed(2);
        const stdDev = Math.sqrt(scores.map(x => Math.pow(x - average, 2))
                                        .reduce((partialSum, nextVal) => partialSum + nextVal, 0)
                                        / totalTester);
        const maxScore = Math.max.apply(null, scores);

        return new ExamInfo(totalTester, average, stdDev, maxScore);
    }

    async #saveStudents(students) {
        const that = this;

        const signupPromises = students.map((student) => {
            return that.#authService.signUpByPhoneNum(student.phoneNum);
        })

        await Promise.all(signupPromises);
        
        await this.#studentRepository.bulkSave(students);
    }

    async #saveRoundExamData(roundExam) {
        await this.#examRepository.bulkSave(roundExam);
    }

    async putDeptDatasToDB(file, courseId) {
        const excel = await this.#getExcel(file);
        const worksheet = excel.worksheets[0];

        const roundDeptDatas = await this.#worksheetService.extractRoundDeptDatas(worksheet, courseId);
        
        for(const roundDeptData of roundDeptDatas) {
            await this.#updateRoundDept(roundDeptData);
        }
    }

    async #updateRoundDept(roundDeptData) {
        for(const studentDept of roundDeptData) {
            if(studentDept.seoulDept) {
                await this.#examRepository.updateSeoulDepts(studentDept);
            }

            if(studentDept.yonseiDept) {
                await this.#examRepository.updateYonseiDepts(studentDept);
            }
        }
    }

    async exportCommonTestExcel(commonRound) {
        this.#removeExcelsDirectory(FILE_PATH, '');

        const workbook = xlsx.utils.book_new(); 

        await this.#createScoreDataSheet(workbook, commonRound);
        await this.#createScoreRuleDataSheet(workbook, commonRound);
        await this.#createRankingDataSheet(workbook, commonRound);

        await xlsx.writeFile( workbook, FILE_PATH + FILE_NAME ); 
        
        //아래는 컨트롤러에 넣기
    }

    async #createScoreDataSheet(workbook, commonRound) {
        const scoreDatas = await this.#examService.getScoreDatas(commonRound);
        const scoreDistSheet = xlsx.utils.json_to_sheet(scoreDatas);
        xlsx.utils.book_append_sheet(workbook, scoreDistSheet, "성적분포");
    }

    async #createScoreRuleDataSheet(workbook, commonRound) {
        const scoreRuleDatas = await this.#totalExamService.getCommonScoreRule(commonRound);
        const scoreRuleSheet = xlsx.utils.aoa_to_sheet(scoreRuleDatas);
        xlsx.utils.book_append_sheet(workbook, scoreRuleSheet, "채점기준");
    }

    async #createRankingDataSheet(workbook, commonRound) {
        const rankingDatas = await this.#examService.getRankingDatas(commonRound);
        const originalSheet = xlsx.utils.json_to_sheet(rankingDatas);
        xlsx.utils.book_append_sheet(workbook, originalSheet, "원본");
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

container.register({
    excelService : asClass(ExcelService)
})