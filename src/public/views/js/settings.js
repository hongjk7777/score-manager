const changePasswordForm = document.querySelector("#change-password-form");
const newPassword = document.querySelector("#newPassword");
const checkNewPassword = document.querySelector("#newPasswordCheck");
const submitBtn = document.querySelector("#submit-btn");

function checkNewPasswordSame(e) {
    e.preventDefault();
    if(!(newPassword.value === checkNewPassword.value)){
        alert("비밀번호가 다릅니다.");
    } else if(newPassword.value.length >= 20) {
        alert("비밀번호가 너무 깁니다");
    } else {
        $(changePasswordForm).trigger("submit");
    }
}

// function checkValidity() {
//     if(!(newPassword.value === checkNewPassword.value)){
//         alert("비밀번호가 다릅니다.")
//         return false;
//     } else {
//         changePasswordForm.trigger("submit");
//         return true;
//     }
// }

submitBtn.addEventListener("click", checkNewPasswordSame);