const students = document.querySelectorAll("#student-info");
const scoreRuleBtn = document.querySelector("#score-rule-btn");
const problemInfoBtn = document.querySelector("#problem-info-btn");

students.forEach(student => {
    const initName = '***';
    const name = student.querySelector("#student-name").innerHTML.trim();
    if(!(name === initName)) {
        // writeMyScore(student);
    }
});

function writeMyScore(student) {
    const firstScore = student.querySelector("#first-score").innerHTML;
    const secondScore = student.querySelector("#second-score").innerHTML;
    const thirdScore = student.querySelector("#third-score").innerHTML;
    const scoreSum = student.querySelector("#score-sum").innerHTML;
    const ranking = student.querySelector("#ranking").innerHTML;

    document.querySelector("#my-first-score").innerHTML = firstScore;
    document.querySelector("#my-second-score").innerHTML = secondScore;
    document.querySelector("#my-third-score").innerHTML = thirdScore;
    document.querySelector("#my-score-sum").innerHTML = scoreSum;
    document.querySelector("#my-ranking").innerHTML = ranking;
}

scoreRuleBtn.addEventListener("click", e => {
    const examRound = document.querySelector("#exam-round").innerHTML;
    const curUrl = window.location.href.split('?')[0];
    location.href=`${curUrl}/score-rule?round=${examRound}`;
});

problemInfoBtn.addEventListener("click", e => {
    const examRound = document.querySelector("#exam-round").innerHTML;
    const studentName = document.querySelector("#username").innerHTML;
    const curUrl = window.location.href.split('?')[0];
    location.href=`${curUrl}/problem-info?round=${examRound}&name=${studentName}`;
});

function makeChart() {
    const examChart = document.getElementById('exam-chart');
    const ctx = examChart.getContext('2d');
    const chartDataStr = examChart.dataset.chart;
    let chartData = chartDataStr.substring(1, chartDataStr.length - 1).split(',').map(x => parseInt(x));
    let backgroundColors = getBackgroundColors();

    const chart = new Chart(ctx, {
        // type : 'bar' = 막대차트를 의미합니다.
        type: 'bar', // 
        data: {
            labels: ['0~5', '6~10', '11~15', '16~20', '21~25', '26~30', '31~35', '36~40', '41~45', '46~50'],
            datasets: [{
                // label: ["내 점수"],
                // pointBackgroundColor: pointBackgroundColors,
                backgroundColor: backgroundColors,
                borderColor: 'rgb(255, 99, 132)',
                data: chartData
            }]
        },
        options: {
            // responsive: false,
            legend: {
                // align: 'end',
                // position: 'top',
                display: false,
            }
        },
        plugins: [{

            beforeDraw: function(c) {
            var legends = c.legend.legendItems;
              legends.forEach(function(e) {
                 e.fillStyle = 'rgb(255, 99, 132)';
              });
            }
      
          }]
    });

    const maxVal = getMaxVal(chartData);
    console.log(maxVal);
    if(maxVal < 5){
        chart.options.scales.yAxes[0].ticks.max = 5;
        chart.options.scales.yAxes[0].ticks.stepSize = 1;
        chart.update();
    }
}

function getMaxVal(chartData) {
    let max = 0;

    for (let i = 0; i < chartData.length; i++) {
        const data = chartData[i];
        max = Math.max(max, data);
    }
    
    return max;
}

function makeSeoulChart() {
    const seoulExamChart = document.getElementById('seoul-exam-chart');
    if(!seoulExamChart){
        return;
    }
    
    const ctx = seoulExamChart.getContext('2d');
    console.log(seoulExamChart.dataset);
    const chartDataStr = seoulExamChart.dataset.chart;
    let chartData = chartDataStr.substring(1, chartDataStr.length - 1).split(',').map(x => parseInt(x));
    let backgroundColors = getBackgroundColors();

    let chart = new Chart(ctx, {
        // type : 'bar' = 막대차트를 의미합니다.
        type: 'bar', // 
        data: {
            labels: ['0~5', '6~10', '11~15', '16~20', '21~25', '26~30', '31~35', '36~40', '41~45', '46~50'],
            datasets: [{
                // label: ["내 점수"],
                // pointBackgroundColor: pointBackgroundColors,
                backgroundColor: backgroundColors,
                borderColor: 'rgb(255, 99, 132)',
                data: chartData
            }]
        },
        options: {
            // responsive: false,
            legend: {
                // align: 'end',
                // position: 'top',
                display: false,
            },
            // scales: {
			// 	yAxes: [{
			// 		ticks: {
			// 			min: -10,
			// 			stepSize : 6,
			// 			fontSize : 14,
			// 		}
			// 	}]
			// }
            
        },
        plugins: [{

            beforeDraw: function(c) {
            var legends = c.legend.legendItems;
              legends.forEach(function(e) {
                 e.fillStyle = 'rgb(255, 99, 132)';
              });
            }
      
          }]
    });


    const maxVal = getMaxVal(chartData);
    if(maxVal < 5){
        chart.options.scales.yAxes[0].ticks.max = 5;
        chart.options.scales.yAxes[0].ticks.stepSize = 1;
        chart.update();
    }
}

function makeYonseiChart() {
    const yonseiExamChart = document.getElementById('yonsei-exam-chart');
    if(!yonseiExamChart){
        return;
    }
    
    const ctx = yonseiExamChart.getContext('2d');
    const chartDataStr = yonseiExamChart.dataset.chart;
    let chartData = chartDataStr.substring(1, chartDataStr.length - 1).split(',').map(x => parseInt(x));
    let backgroundColors = getBackgroundColors();

    const chart = new Chart(ctx, {
        // type : 'bar' = 막대차트를 의미합니다.
        type: 'bar', // 
        data: {
            labels: ['0~5', '6~10', '11~15', '16~20', '21~25', '26~30', '31~35', '36~40', '41~45', '46~50'],
            datasets: [{
                // label: ["내 점수"],
                // pointBackgroundColor: pointBackgroundColors,
                backgroundColor: backgroundColors,
                borderColor: 'rgb(255, 99, 132)',
                data: chartData
            }]
        },
        options: {
            // responsive: false,
            legend: {
                // align: 'end',
                // position: 'top',
                display: false,
            }
        },
        plugins: [{

            beforeDraw: function(c) {
            var legends = c.legend.legendItems;
              legends.forEach(function(e) {
                 e.fillStyle = 'rgb(255, 99, 132)';
              });
            }
      
          }]
    });

    const maxVal = getMaxVal(chartData);
    if(maxVal < 5){
        chart.options.scales.yAxes[0].ticks.max = 5;
        chart.options.scales.yAxes[0].ticks.stepSize = 1;
        chart.update();
    }
}

function getBackgroundColors() {
    let backgroundColors = Array(10).fill("gray");

    const myScoreIndex = Math.ceil(parseInt(document.querySelector('#score-sum').innerHTML) / 5) - 1;
    if(myScoreIndex < 0) {
        myScoreIndex = 0;
    }
    
    backgroundColors[myScoreIndex] = "rgb(255, 99, 132)";

    return backgroundColors;
}

makeChart();
makeSeoulChart();
makeYonseiChart();
