function displayProfile(){
    let token = localStorage.getItem('token');
    if(token != null){
        document.body.innerHTML = document.getElementById("profilescript").innerHTML;
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