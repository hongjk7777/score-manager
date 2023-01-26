export default class DeptInfoDTO {
    ranking;
    tester;
    average;
    topScore;
    chartData;

    constructor(ranking, tester, average, topScore, chartData) {
        this.ranking = ranking;
        this.tester = tester;
        this.average = average;
        this.topScore = topScore;
        this.chartData = chartData;
    }
}