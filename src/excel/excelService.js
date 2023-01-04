import ExcelJS from "exceljs";
import ExamRepository from "../db/exam/examRepository";
import StudentRepository from "../db/student/studentRepository";
import TotalExamRepository from "../db/totalExam/totalExamRepository";
import ExcelErrorMsg from "../validator/excelErrorMsg";
import WorksheetService from "./worksheetService";



export default class ExcelService {
    #examRepository = new ExamRepository();
    #totalExamRepository = new TotalExamRepository();
    #studentRepository = new StudentRepository();
    #worksheetService = new WorksheetService();


    async putExcelValToDB(file, classId) {
        this.#initExcelDirectory(file);
    
        const excel = await this.#getExcel(file);
        const success = await this.#deleteClassPrevDB(classId);

        if(success) {
            const personalSheetName = '개인';
            const personalSheet = this.#worksheetService.findWorksheetByName(personalSheetName);
            if (personalSheet == null) {
                throw new RangeError(ExcelErrorMsg.NO_PERSONAL_PAGE);
                //개인별 성적이 없을 경우 예외처리
            }

            this.#worksheetService.handleExamDatas(personalSheet, classId);
            //TODO: 아래 함수들 구현 요망
            //const worksheet = excel.worksheets[0];
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

    async #deleteClassPrevDB(classId) {
        await this.#examRepository.deleteByClassId(classId);
        await this.#studentRepository.deleteByClassId(classId);
        await this.#totalExamRepository.deleteByClassId(classId);
    }
}
