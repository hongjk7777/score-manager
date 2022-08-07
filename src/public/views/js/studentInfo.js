const username = document.querySelector('#username').innerHTML;
const examRounds = document.querySelectorAll("#exam-round");
const infoBtns = document.querySelectorAll("#info-btn");


for (let i = 0; i < examRounds.length; i++) {
    const infoBtn = infoBtns[i];
    console.log(examRounds);

    //queryString 제거
    const curUrl = window.location.href.split('?')[0];
    console.log(curUrl);

    infoBtn.addEventListener("click", e => {
        location.href=`${curUrl}/exam?round=${examRounds[i].innerHTML.charAt(0)}&name=${username}`;
    })   
}
