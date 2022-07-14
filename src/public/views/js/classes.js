const classAddBtn = document.getElementById("class-add-btn");
const curUrl = window.location.href;

classAddBtn.addEventListener("click", (e) => {
    location.href=`${curUrl}/add`;
})