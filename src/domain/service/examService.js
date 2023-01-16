import ExportExamDTO from "../../dto/exportExamDTO";
import ExamRepository from "../db/exam/examRepository";

export default class ExamService {
    #examRepository = new ExamRepository();

    async getScoreDatas(commonRound) {
        const scoreSumDatas = await this.#examRepository.findAllScoreSum(commonRound);
        //함수형 프로그래밍이 더 조은가?
        this.#addRanking(scoreSumDatas);
        this.#addDistribution(scoreSumDatas);

        const scoreDatas = this.#changeToScoreDatas(scoreSumDatas);

        return scoreDatas;
    }

    #addRanking(datas) {
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
        this.#addRanking(commonRanking);

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
}