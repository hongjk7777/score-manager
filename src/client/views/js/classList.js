const classAddBtn = document.getElementById("class-add-btn");
const curUrl = window.location.href;

function addClassLink() {
    const classList = document.querySelectorAll("#class");
    const classIds = document.querySelectorAll("#class-id");

    for (let i = 0; i < classList.length; i++) {
        const classId = classIds[i].innerHTML;
        const aClass = classList[i];
    
        aClass.addEventListener("click", (e) => {
            location.href=`${curUrl}/${classId}`
        });
    }
}

classAddBtn.addEventListener("click", (e) => {
    location.href=`${curUrl}/add`;
});

addClassLink();
