const students = document.querySelectorAll("#student-info");
const scoreRuleBtn = document.querySelector("#score-rule-btn");
const problemInfoBtn = document.querySelector("#problem-info-btn");
const seoulDeptSelect = document.querySelector("#seoul-dept-select")
const yonseiDeptSelect = document.querySelector("#yonsei-dept-select")
const studentId = document.querySelector("#student-id").innerHTML;

const examRound = document.querySelector("#exam-round").innerHTML;

scoreRuleBtn.addEventListener("click", e => {
    const curUrl = window.location.href.split('?')[0];
    location.href=`${curUrl}/score-rule?round=${examRound}`;
});

problemInfoBtn.addEventListener("click", e => {
    const studentName = document.querySelector("#username").innerHTML;
    const curUrl = window.location.href.split('?')[0];
    location.href=`${curUrl}/problem-info?round=${examRound}&name=${studentName}&id=${studentId}`;
});

function makeChart() {
    const examChart = document.getElementById('exam-chart');
    const ctx = examChart.getContext('2d');
    const chartDataStr = examChart.dataset.chart;
    let chartData = chartDataStr.substring(1, chartDataStr.length - 1).split(',').map(x => parseInt(x));
    let backgroundColors = getChartColor();

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

function getMaxVal(chartData) {
    let max = 0;

    for (let i = 0; i < chartData.length; i++) {
        const data = chartData[i];
        max = Math.max(max, data);
    }
    
    return max;
}

let seoulExamChart;
function makeSeoulChart() {
    const seoulExamCanvas = document.getElementById('seoul-exam-chart');
    if(!seoulExamCanvas){
        return;
    }
    
    const ctx = seoulExamCanvas.getContext('2d');
    console.log(seoulExamCanvas.dataset);
    const chartDataStr = seoulExamCanvas.dataset.chart;
    let chartData = chartDataStr.substring(1, chartDataStr.length - 1).split(',').map(x => parseInt(x));
    let backgroundColors = getChartColor();

    seoulExamChart = new Chart(ctx, {
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
        seoulExamChart.options.scales.yAxes[0].ticks.max = 5;
        seoulExamChart.options.scales.yAxes[0].ticks.stepSize = 1;
        seoulExamChart.update();
    }
}

let yonseiExamChart;
function makeYonseiChart() {
    const yonseiExamCanvas = document.getElementById('yonsei-exam-chart');
    if(!yonseiExamCanvas){
        return;
    }
    
    const ctx = yonseiExamCanvas.getContext('2d');
    const chartDataStr = yonseiExamCanvas.dataset.chart;
    let chartData = chartDataStr.substring(1, chartDataStr.length - 1).split(',').map(x => parseInt(x));
    let backgroundColors = getChartColor();

    yonseiExamChart = new Chart(ctx, {
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
        yonseiExamChart.options.scales.yAxes[0].ticks.max = 5;
        yonseiExamChart.options.scales.yAxes[0].ticks.stepSize = 1;
        yonseiExamChart.update();
    }
}

function getChartColor() {
    let backgroundColors = Array(10).fill("gray");

    const myScoreIndex = Math.ceil(parseInt(document.querySelector('#score-sum').innerHTML) / 5) - 1;
    if(myScoreIndex < 0) {
        myScoreIndex = 0;
    }
    
    backgroundColors[myScoreIndex] = "rgb(255, 99, 132)";

    return backgroundColors;
}


const curUrl = window.location.href.split('?')[0];

function handleSeoulDeptChange(e) {
    const deptName = e.target.value;

    axios({
        url: `${curUrl}/seoul-dept?round=${examRound}&name=${deptName}`, 
        method: 'get'
    }).then(function(res){
        console.log(res.data);
        changeChartData(seoulExamChart, res.data);
        changeSeoulDeptName(deptName);
        changeChartColor(seoulExamChart);
    });
}

function handleYonseiDeptChange(e) {
    const deptName = e.target.value;
    axios({
        url: `${curUrl}/yonsei-dept?round=${examRound}&name=${deptName}`, 
        method: 'get'
    }).then(function(res){
        console.log(res.data);
        changeChartData(yonseiExamChart, res.data);
        changeYonseiDeptName(deptName);
        changeChartColor(yonseiExamChart);
    });
}

function changeChartData(examChart, newDataSet, deptName){
    removeExamChart(examChart);
    addExamChart(examChart, newDataSet);
    examChart.update(); 
}

function removeExamChart(examChart) {
    examChart.data.datasets[0].data = [];
}

function addExamChart(examChart, newDataSet) {
    newDataSet.forEach(newData => {
        examChart.data.datasets[0].data.push(newData);
    });
}

function changeSeoulDeptName(deptName) {
    const seoulDeptName = document.querySelector("#seoul-dept-name");
    seoulDeptName.innerText = `서울대 ${deptName} 성적`;
}

function changeYonseiDeptName(deptName) {
    const yonseiDeptName = document.querySelector("#yonsei-dept-name");
    yonseiDeptName.innerText = `연세대 ${deptName} 성적`;
}

function changeChartColor(examChart) {
    examChart.data.datasets[0].backgroundColor = Array(10).fill("gray");
    examChart.update(); 
}

// if(seoulDeptSelect){
//     seoulDeptSelect.addEventListener("change", handleSeoulDeptChange);
// }

// if(yonseiDeptSelect){
//     yonseiDeptSelect.addEventListener("change", handleYonseiDeptChange);
// }

makeChart();
makeSeoulChart();
makeYonseiChart();
