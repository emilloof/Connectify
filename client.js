function displayProfile(){
    let token = localStorage.getItem('token');
    if(token != null){
        document.body.innerHTML = document.getElementById("profilescript").innerHTML;
        document.getElementById("default").click();
    }

    else{
        document.body.innerHTML = document.getElementById("welcomescript").innerHTML;
    }

}

function validatePasswordLogin(input) {
    let password = input.loginpassword.value;
    if (!isLongPassword(password)) {
        document.getElementById('feedbackLogin').innerHTML = "Minimum password length is 8 chars!";
    }
    else {
        let username = input.loginemail.value;
        let answer = serverstub.signIn(username, password);
            
        if(!answer.success) {
            document.getElementById('feedbackLogin').innerHTML = answer.message;
        }
        else{
            let token = answer.data;
            localStorage.setItem('token', token);
            displayProfile();
        }
        
    }
}

function validatePasswordSignUp(input) {
    try {
        let password1 = input.signuppassword1.value;
        let password2 = input.signuppassword2.value;
        if (password1 != password2) {
            document.getElementById('feedbackSignUp').innerHTML = "The two passwords are not the same!";
        }
        else if (!isLongPassword(password1)) {
            document.getElementById('feedbackSignUp').innerHTML = "Minimum password length is 8 chars!";
        }
        else {
            let dataObject = {
                email: input.signupemail.value,
                password: input.signuppassword1.value,
                firstname: input.firstname.value,
                familyname: input.familyname.value,
                gender: input.gender.value,
                city: input.city.value,
                country: input.country.value
            };
            let answer = serverstub.signUp(dataObject);
            document.getElementById('feedbackSignUp').innerHTML = answer.message;
            
        }
    }
    catch(e) {
        document.getElementById('feedbackSignUp').innerHTML = e.message;
    }
}

function isLongPassword(password) {
    if (password.length < 8) {
        return false;
    }
    return true;
}

window.onload = displayProfile;


function openTab(pageName, element){
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
    }

    document.getElementById(pageName).style.display = "block";
    element.style.backgroundColor = "red";
}

function changePassword(input){
    try{
        let token = localStorage.getItem('token');
        let oldPassword = input.oldpassword.value;
        let newPassword = input.newpassword1.value;
        let newPassword2 = input.newpassword2.value;
        if(newPassword != newPassword2){
            document.getElementById('feedbackChange').innerHTML = "The two new passwords are not the same!";
        }
        else if(!isLongPassword(newPassword)){
            document.getElementById('feedbackChange').innerHTML = "Minimum password length is 8 chars!";
             }
        else{
            let answer = serverstub.changePassword(token, oldPassword, newPassword)
            document.getElementById('feedbackChange').innerHTML = answer.message;
        }
    }
    catch(e){
        document.getElementById('feedbackChange').innerHTML = e.message;
    }
}

function signOut(){
    let token = localStorage.getItem('token');
    let answer = serverstub.signOut(token);
    localStorage.removeItem('token'); //maybe use "" instead of null
    displayProfile();
    document.getElementById('feedbackLogin').innerHTML = answer.message;
}