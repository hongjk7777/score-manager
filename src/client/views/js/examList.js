const curUrl = window.location.href;
const examRounds = document.querySelectorAll("#exam-round");
const infoBtns = document.querySelectorAll("#info-btn");


for (let i = 0; i < infoBtns.length; i++) {
    const round = parseInt(examRounds[i].innerHTML);
    const infoBtn = infoBtns[i];
    infoBtn.addEventListener("click", e => {
        location.href=`${curUrl}/exam?round=${round}`
    })   
}
