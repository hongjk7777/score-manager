const curUrl = window.location.href;
const deleteBtn = document.querySelector("#delete-btn");

deleteClass();
addStudentLink();
addExamLink();

function deleteClass() {
    deleteBtn.addEventListener("click", (e) => {
        if(window.confirm("정말로 삭제하시겠습니까?")) {
            location.href=`${curUrl}/delete`;
        }
    });
}


function addStudentLink() {
    const studentNameList = document.querySelectorAll("#student-name");
    const studentList = document.querySelectorAll("#student");

    for (let i = 0; i < studentList.length; i++) {
        const studentName = studentNameList[i].innerHTML;
        const student = studentList[i];
    
        student.addEventListener("click", (e) => {
            location.href=`${curUrl}/student?name=${studentName}`
        });
    }
}

function addExamLink() {
    const examRounds = document.querySelectorAll("#exam-round");
    const examList = document.querySelectorAll("#exam");
    
    for (let i = 0; i < examList.length; i++) {
        const examRound = examRounds[i].innerHTML.charAt(0);
        const exam = examList[i];
        
        exam.addEventListener("click", (e) => {
            location.href=`${curUrl}/exam?round=${examRound}`
        });
    }
}



