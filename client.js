function displayProfile(){
    let token = localStorage.getItem('token');
    if(token != null){
        document.body.innerHTML = document.getElementById("profilescript").innerHTML;
        document.getElementById("default").click();
        displayHomeInfo();
        homeReloadWall();
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
    localStorage.removeItem('email');
    displayProfile();
    document.getElementById('feedbackLogin').innerHTML = answer.message;
}

function displayHomeInfo(){
    let token = localStorage.getItem('token');
    let user = serverstub.getUserDataByToken(token).data;
    let data = `
        <h2>Profile</h2>
        <p>First Name: ${user.firstname}</p>
        <p>Family Name: ${user.familyname}</p>
        <p>Gender: ${user.gender}</p>
        <p>City: ${user.city}</p>
        <p>Country: ${user.country}</p>
        <p>Email: ${user.email}</p>
        `
        document.getElementById("homeuserinfo").innerHTML = data;
}

function displayBrowseInfo(){
    let token = localStorage.getItem('token');
    let email = localStorage.getItem('email');
    let user = serverstub.getUserDataByEmail(token, email).data;
    let data = `
        <h2>Profile</h2>
        <p>First Name: ${user.firstname}</p>
        <p>Family Name: ${user.familyname}</p>
        <p>Gender: ${user.gender}</p>
        <p>City: ${user.city}</p>
        <p>Country: ${user.country}</p>
        <p>Email: ${user.email}</p>
        `
        document.getElementById("browseuserinfo").innerHTML = data;
}

function homeSendMessage(data){
    document.getElementById('homefeedbackmessage').innerHTML = "";
    let token = localStorage.getItem('token');
    let user = serverstub.getUserDataByToken(token).data;
    let email = user.email;
    let message = data.messagefield.value;
    if(message.length != 0){
        let answer = serverstub.postMessage(token, message, email);
        if (answer.success){
            document.getElementById("homemessagefield").value = "";
            homeReloadWall();
        }
        else{
            document.getElementById('homefeedbackmessage').innerHTML = answer.message
        }
    }
    else{
        document.getElementById('homefeedbackmessage').innerHTML = "Message field is empty!";
    }
}

function browseSendMessage(data){
    document.getElementById('browsefeedbackmessage').innerHTML = "";
    let token = localStorage.getItem('token');
    let email = localStorage.getItem('email');
    let message = data.messagefield.value;
    if(message.length != 0){
        let answer = serverstub.postMessage(token, message, email);
        if (answer.success){
            document.getElementById("browsemessagefield").value = "";
            reloadWall();
        }
        else{
            document.getElementById('browsefeedbackmessage').innerHTML = answer.message
        }
    }
    else{
        document.getElementById('browsefeedbackmessage').innerHTML = "Message field is empty!";
    }
}

function homeReloadWall(){
    document.getElementById("homemessagewall").innerHTML = "";
    let token = localStorage.getItem('token');
    let messagewall = (serverstub.getUserMessagesByToken(token)).data;
  
    for (let index in messagewall) {
        let output = '<div>' + messagewall[index].writer + ': ' + messagewall[index].content + '</div>';
        document.getElementById("homemessagewall").innerHTML += output;
    }
}

function browseReloadWall(){
    document.getElementById("browsemessagewall").innerHTML = "";
    let token = localStorage.getItem('token');
    let email = localStorage.getItem('email');
    let messagewall = (serverstub.getUserMessagesByEmail(token, email)).data;
  
    for (let index in messagewall) {
        let output = '<div>' + messagewall[index].writer + ': ' + messagewall[index].content + '</div>';
        document.getElementById("browsemessagewall").innerHTML += output;
    }
}

function searchUser(input){
    let token = localStorage.getItem('token');
    let searchEmail = input.searchemail.value;
    let user = serverstub.getUserDataByToken(token).data;
    let userEmail = user.email;
    document.getElementById("feedbacksearch").innerHTML = "";
    if (userEmail === searchEmail){
        document.getElementById("feedbacksearch").innerHTML = "You cannot search your own email!";
    }
    else if(serverstub.getUserMessagesByEmail(token, searchEmail).success){
        document.getElementById('browsemessagediv').style.display = "block";
        localStorage.setItem('email', searchEmail);
        displayBrowseInfo();
        browseReloadWall();
    }
    else {
        document.getElementById("feedbacksearch").innerHTML = "Email does not exist!";
    }
}