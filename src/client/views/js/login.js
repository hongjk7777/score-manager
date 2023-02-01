const loginForm = document.querySelector('#login-form');
const loginBtn = document.querySelector('#login-btn');

function login(e) {
    const username = document.querySelector('#username').value;
    console.log(username);
    const password = document.querySelector('#password').value;
    console.log(password);

    axios({
        url: `/login/password`, 
        method: 'post',
        data: {
            'username': username,
            'password': password
        }
    }).then(function(res){
        const isAdmin = res.data.admin;
        
        if(isAdmin) {
            const adminRoute = '/classList';
            window.location.href = window.location.protocol + "//" + window.location.host + adminRoute;
        } else {
            const studentRoute = '/class';
            window.location.href = window.location.protocol + "//" + window.location.host + studentRoute;
        }
    }).catch(function(err) {
        alert('회원 정보가 일치하지 않습니다.')
    });
}

loginForm.addEventListener("keyup", function(e) {
    if (e.code === 'Enter') {
        loginBtn.click();
    }
});
loginBtn.addEventListener("click", login);