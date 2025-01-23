function validatePasswordLogin(input) {
    let password = input.loginpassword.value;
    if (!isLongPassword(password)) {
        document.getElementById('feedbackLogin').innerHTML = "Minimum password length is 8 chars!";
    }
    else {
        document.getElementById('feedbackLogin').innerHTML = "Success";
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
            document.getElementById('feedbackSignUp').innerHTML = "Success";
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