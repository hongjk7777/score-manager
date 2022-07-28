const students = document.querySelectorAll("#student-info");
const scoreRuleBtn = document.querySelector("#score-rule-btn");

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
    const examRound = document.querySelector("#exam-round").innerHTML.charAt(0);
    location.href=`/class/score-rule?round=${examRound}`;
});