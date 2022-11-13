const classAddBtn = document.getElementById("class-add-btn");
const curUrl = window.location.href;

function addClassLink() {
    const classList = document.querySelectorAll("#class");
    const classNameList = document.querySelectorAll("#class-name");

    for (let i = 0; i < classList.length; i++) {
        const className = classNameList[i].innerHTML;
        const aClass = classList[i];
    
        aClass.addEventListener("click", (e) => {
            location.href=`${curUrl}/class?className=${className}`
        });
    }
}

classAddBtn.addEventListener("click", (e) => {
    location.href=`${curUrl}/add`;
});

addClassLink();
