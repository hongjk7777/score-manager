import ExportExamDTO from "../../dto/exportExamDTO";
import ExamRepository from "../db/exam/examRepository";
import TotalExamService from "./totalExamService";
import _ from 'lodash'
import DeptInfoDTO from "../../dto/deptInfoDTO";

export default class ExamService {
    #examRepository = new ExamRepository();
    #totalExamService = new TotalExamService();

    async getScoreDatas(commonRound) {
        const scoreSumDatas = await this.#examRepository.findAllScoreSum(commonRound);
        //함수형 프로그래밍이 더 조은가?
        this.#addExtractRanking(scoreSumDatas);
        this.#addDistribution(scoreSumDatas);

        const scoreDatas = this.#changeToScoreDatas(scoreSumDatas);

        return scoreDatas;
    }

    #addExtractRanking(datas) {
        let sameCount = 0;
        let lastScore = -1;

        datas.forEach((data, index) => {
            if(data.score_sum === lastScore) {
                sameCount++;
            }  else {
                sameCount = 0;
            }

            data.ranking = index + 1 - sameCount;

            lastScore = data.score_sum;
        });
    }

    #addDistribution(scoreDatas) {
        const totalPeople = scoreDatas.length;

        scoreDatas.forEach(scoreData => {
            const distribution = ((totalPeople - scoreData.ranking) / totalPeople) * 100;
            scoreData.distribution = distribution.toFixed(1);
        });
    }

    #changeToScoreDatas(scoreSumDatas) {
        const scoreDatas = [];
        
        scoreSumDatas.forEach(scoreSumData => {
            const scoreData = this.#changeToScoreData(scoreSumData);

            scoreDatas.push(scoreData);
        });

        return scoreDatas;
    }

    //엑셀에 한국어를 넣기 위해 속성이름을 변경   
    #changeToScoreData(scoreSumData) {
        let scoreData = {};

        scoreData['점수'] = scoreSumData['score_sum'];
        scoreData['등수'] = scoreSumData['ranking'];
        scoreData['백분위'] = scoreSumData['distribution'];
        
        return scoreData;
    }

    async getRankingDatas(commonRound) {
        const commonRanking = await this.#examRepository.findCommonExamRanking(commonRound);
        this.#addExtractRanking(commonRanking);

        const exportExamDTOs = this.#changeToExportExamDTO(commonRanking);
        const rankingDatas = this.#changeToRankingDatas(exportExamDTOs);

        return rankingDatas;  
    }

    #changeToExportExamDTO(datas) {
        const exportExamDTOs = new Array();

        datas.forEach(data => {
            const rankingData = new ExportExamDTO(data.index, data.scores[0], data.scores[1], data.scores[2],
                    data.scoreSum, data.ranking, data.studentName, data.courseName, 
                    data.seoulDept, data.yonseiDept, data.phoneNum);
            exportExamDTOs.push(rankingData);
        });

        return exportExamDTOs;
    }

    #changeToRankingDatas(exportExamDTOs) {
        const rankingDatas = [];
        
        exportExamDTOs.forEach(exportExamDTO => {

            const rankingData = this.#changeToRankingData(exportExamDTO);

            rankingDatas.push(rankingData);
        });

        return rankingDatas;
    }

    //엑셀에 한국어를 넣기 위해 속성이름을 변경   
    #changeToRankingData(exportExamDTO) {
        let rankingData = {};
   
        rankingData['번호'] = exportExamDTO['index'];
        rankingData['분반'] = exportExamDTO['courseName'];
        rankingData['이름'] = exportExamDTO['studentName'];
        rankingData['전화번호'] = exportExamDTO['phoneNum'];
        rankingData['문제(1)'] = exportExamDTO['firstScore'];
        rankingData['문제(2)'] = exportExamDTO['secondScore'];
        rankingData['문제(3)'] = exportExamDTO['thirdScore'];
        rankingData['총합'] = exportExamDTO['scoreSum'];
        rankingData['등수'] = exportExamDTO['ranking'];
        rankingData['서울대 지원학과'] = exportExamDTO['seoulDept'];
        rankingData['연세대 지원학과'] = exportExamDTO['yonseiDept'];

        return rankingData;
    }

    async getStudentExams(studentId, courseId) {
        const roundCount = await this.#getExamRoundCount(courseId);
        const examInfos = new Array();

        for (let round = 1; round <= roundCount; round++) {
            const examInfo = await this.getStudentExam(studentId, round, courseId);
            
            examInfos.push(examInfo);   
        }
        

        return examInfos;
    }

    async #getExamRoundCount(courseId) {
        return await this.#examRepository.findExamRoundCount(courseId);
    }

    async getStudentExam(studentId, round, courseId) {
        const exams = await this.getSortedExams(round, courseId);

        let studentExam = this.#selectStudentExam(exams, studentId);
        
        if(studentExam) {
            studentExam = this.#addScoreInfo(studentExam, exams);
        }

        return studentExam;
    }

    async getSortedExams(round, courseId) {
        let exams;

        const commonRound = await this.#totalExamService.getCommonRound(round, courseId);

        if (this.#isCommonExam(commonRound)) {
            exams = await this.#examRepository.findByCommonRound(commonRound);
        } else {
            exams = await this.#examRepository.findByRoundAndCourseId(round, courseId);
        }

        exams = this.#sortExam(exams);
        exams = this.#addRanking(exams);

        return exams;
    }

    #sortExam(exams) {
        const copyExams = _.cloneDeep(exams);

        copyExams.sort(function(a, b)  {
            if(a.scoreSum > b.scoreSum) return -1;
            if(a.scoreSum === b.scoreSum) return 0;
            if(a.scoreSum < b.scoreSum) return 1;
        });

        return copyExams;
    }

    #addRanking(exams) {
        const copyExams = _.cloneDeep(exams);

        let sameCount = 0;
        let lastScore = -1;

        copyExams.forEach((exam, index) => {
            if(exam.scoreSum === lastScore) {
                sameCount++;
            }  else {
                sameCount = 0;
            }

            exam.ranking = index + 1 - sameCount;

            lastScore = exam.scoreSum;
        });

        return copyExams;
    }

    #addScoreInfo(studentExam, exams) {
        const copyExam = _.cloneDeep(studentExam);
        
        copyExam.topScore = Math.max.apply(null, exams.map(exam => exam.scoreSum));
        copyExam.totalTester = exams.length;
        copyExam.percent = ((copyExam.ranking / copyExam.totalTester) * 100).toFixed(0);
        copyExam.average = (exams.reduce((sum, curVal) => sum + curVal.scoreSum, 0) / exams.length).toFixed(2);
        copyExam.standardDev = (Math.sqrt(exams.map(exam => Math.pow(exam.scoreSum - copyExam.average, 2))
            .reduce((a, b) => a + b) / copyExam.totalTester)).toFixed(2);
        copyExam.chartData = this.#getChartData(exams.map(exam => exam.scoreSum));

        return copyExam;
    }

    #getChartData(scores) {
        const chartData = new Array(10).fill(0);

        scores.forEach(score => {
            if(score != 0) {
                chartData[Math.ceil(score / 5) - 1]++;
            } else {
                chartData[0]++;
            }
        })

        return chartData;
    }

    #isCommonExam(commonRound) {
        return commonRound > 0;
    }

    #selectStudentExam(exams, studentId) {
        let studentExam = null;


        exams.forEach((exam) => {
            if (exam.studentId === studentId) {
                studentExam = exam;
            }
        });

        return studentExam;
    }

    async getSeoulDeptInfo(commonRound, studentId, seoulDept) {
        let exams = await this.#examRepository.findByCommonRoundAndSeoulDept(commonRound, seoulDept);

        exams = this.#sortExam(exams);
        exams = this.#addRanking(exams);

        let seoulDeptInfo = this.#selectStudentExam(exams, studentId);
        
        if(seoulDeptInfo) {
            seoulDeptInfo = this.#addScoreInfo(seoulDeptInfo, exams)

            return new DeptInfoDTO(seoulDeptInfo.ranking, seoulDeptInfo.totalTester, seoulDeptInfo.average,
                seoulDeptInfo.topScore, seoulDeptInfo.chartData);
        }

        return null;
    }

    async getYonseiDeptInfo(commonRound, studentId, yonseiDept) {
        let exams = await this.#examRepository.findByCommonRoundAndYonseiDept(commonRound, yonseiDept);

        exams = this.#sortExam(exams);
        exams = this.#addRanking(exams);

        let yonseiDeptInfo = this.#selectStudentExam(exams, studentId);
        
        if(yonseiDeptInfo) {
            yonseiDeptInfo = this.#addScoreInfo(yonseiDeptInfo, exams)

            return new DeptInfoDTO(yonseiDeptInfo.ranking, yonseiDeptInfo.totalTester, yonseiDeptInfo.average,
                yonseiDeptInfo.topScore, yonseiDeptInfo.chartData);
        }
        
        return null;
    }
}
