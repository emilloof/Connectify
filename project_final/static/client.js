function displayProfile(){
    let token = localStorage.getItem('token');
    console.log(token)
    if(token != null){
        let ws = new WebSocket("ws://localhost:5000/echo");

        ws.onopen = function() {
            ws.send(token);
        };

        ws.onmessage = function(event) {
            if (event.data === "You have been logged out due to login from another browser.") {
                signOut(1);
            }
        };
        console.log("profile");
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
    let password_temp = input.loginpassword.value;
    if (!isLongPassword(password_temp)) {
        document.getElementById('feedbackLogin').innerHTML = "Minimum password length is 8 chars!";
    }
    else {      
        let dataObject = {
            username: input.loginemail.value,
            password: password_temp
        } 
        let xhttp = new XMLHttpRequest();
        xhttp.open('POST', '/sign_in', true);
        xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhttp.send(JSON.stringify(dataObject));
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    let answer = JSON.parse(xhttp.responseText);
                    let token = answer.data;
                    localStorage.setItem('token', token);
                    displayProfile();
                }
                else if (this.status == 400) {
                    document.getElementById('feedbackLogin').innerHTML = "You have entered an invalid input!";
                }
                else if (this.status == 401) {
                    document.getElementById('feedbackLogin').innerHTML = "Wrong password!";
                }
                else if (this.status == 404) {
                    document.getElementById('feedbackLogin').innerHTML = "User not found!";
                }
                else if (this.status == 500) {
                    document.getElementById('feedbackLogin').innerHTML = "An internal error occured.";
                }
            }
        }
    }
}


function validatePasswordSignUp(input) {
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
        
        let xhttp = new XMLHttpRequest();
        xhttp.open('POST', '/sign_up', true);
        xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhttp.send(JSON.stringify(dataObject));
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 201) {
                    document.getElementById('feedbackSignUp').innerHTML = "Signed up successfully!";
                }
                else if (this.status == 400){
                    let answer = JSON.parse(xhttp.responseText);
                    if (answer.message == "Invalid email"){
                        document.getElementById('feedbackSignUp').innerHTML = "You have entered an invalid email!";
                    }
                    else if (answer.message == "Invalid input"){
                        document.getElementById('feedbackSignUp').innerHTML = "You have entered invalid input!";
                    }
                }
                else if (this.status == 409) {
                    document.getElementById('feedbackSignUp').innerHTML = "Email taken. Use another!";
                }
                else if (this.status == 500) {
                    document.getElementById('feedbackSignUp').innerHTML = "An internal error occured.";
                }
            }
        }
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
        let dataObject = {
            oldpassword: oldPassword,
            newpassword: newPassword
        }
        let xhttp = new XMLHttpRequest();
        xhttp.open('PUT', '/change_password', true);
        xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhttp.setRequestHeader('Authorization', token);
        xhttp.send(JSON.stringify(dataObject));
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    document.getElementById('feedbackChange').innerHTML = "Password changed successfully!";
                }
                else if (this.status == 400){
                    let answer = JSON.parse(xhttp.responseText);
                    if (answer.message == "Invalid input"){
                        document.getElementById('feedbackChange').innerHTML = "You have entered invalid input!";
                    }
                    else if (answer.message == "Same password"){
                        document.getElementById('feedbackChange').innerHTML = "The new password can not be the same as the old one!";
                    }
                }   
                else if (this.status == 401) {
                    let answer = JSON.parse(xhttp.responseText);
                    if (answer.message == "Incorrect old password") {
                        document.getElementById('feedbackChange').innerHTML = "The old password is incorrect!";
                    }
                    else if (answer.message == "Wrong token") {
                        document.getElementById('feedbackChange').innerHTML = "Your local token doesnt match with the one on our server!";
                    }
                }
                else if (this.status == 500) {
                    document.getElementById('feedbackChange').innerHTML = "An internal error occured.";
                }
            }
        }
    }
}

function signOut(forced = 0){
    let token = localStorage.getItem('token');
    let xhttp = new XMLHttpRequest();
    let url = '/sign_out/' + forced;
    xhttp.open('DELETE', url, true);
    xhttp.setRequestHeader('Authorization', token);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                localStorage.removeItem('token'); 
                localStorage.removeItem('email');
                displayProfile();
                let answer = JSON.parse(xhttp.responseText);
                if (answer.message == "Forced logout") {
                    document.getElementById('feedbackLogin').innerHTML = "Forced logout!";
                }
                else if (answer.message == "Successfully logged out") {
                    document.getElementById('feedbackLogin').innerHTML = "Successfully logged out!";
                }
            }
            else if (this.status == 401) {
                document.getElementById('feedbackChange').innerHTML = "Your local token doesnt match with the one on our server!";
            }
            else if (this.status == 500) {
                document.getElementById('feedbackChange').innerHTML = "An internal error occured.";
            }
        }
    }
}

function displayHomeInfo(){
    let token = localStorage.getItem('token');
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', '/get_user_data_by_token', true);
    xhttp.setRequestHeader('Authorization', token);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if ( this.readyState == 4){
            if (this.status == 200 ) {
                let answer = JSON.parse(xhttp.responseText);
                let user = answer.data;
                let data = `
                <h2>Your Profile</h2>
                <p>First Name: ${user.firstname}</p>
                <p>Family Name: ${user.familyname}</p>
                <p>Gender: ${user.gender}</p>
                <p>City: ${user.city}</p>
                <p>Country: ${user.country}</p>
                <p>Email: ${user.email}</p>
                `
                document.getElementById("homeuserinfo").innerHTML = data;
            }
            else if (this.status == 401){
                document.getElementById('homeuserinfo').innerHTML = "Your local token doesnt match with the one on our server!";
            }
            else if (this.status == 500) {
                document.getElementById('homeuserinfo').innerHTML = "An internal error occured.";
            }
        }
    }
}

function displayBrowseInfo(){
    let token = localStorage.getItem('token');
    let email = document.getElementById('searchemail').value;
    let xhttp = new XMLHttpRequest();         
    let url = "/get_user_data_by_email/" + email;
    xhttp.open("GET", url, true);
    xhttp.setRequestHeader('Authorization', token);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                let answer = JSON.parse(xhttp.responseText);
                let user = answer.data;
                let data = `
                <h2>${user.firstname}s Profile</h2>
                <p>First Name: ${user.firstname}</p>
                <p>Family Name: ${user.familyname}</p>
                <p>Gender: ${user.gender}</p>
                <p>City: ${user.city}</p>
                <p>Country: ${user.country}</p>
                <p>Email: ${user.email}</p>
                `
                document.getElementById("browseuserinfo").innerHTML = data;
            }
            else if (this.status == 401){
                document.getElementById('browseuserinfo').innerHTML = "Your local token doesnt match with the one on our server!";
            }
            else if (this.status == 404){
                document.getElementById('feedbacksearch').innerHTML = "No user with the given email found!";
            } 
            else if (this.status == 500) {
                document.getElementById('browseuserinfo').innerHTML = "An internal error occured.";
            }
        }
    }
}


function homeSendMessage(data){
    document.getElementById('homefeedbackmessage').innerHTML = "";
    let message_temp = data.messagefield.value;
    if (message_temp == "") {
        document.getElementById('homefeedbackmessage').innerHTML = "Message field is empty!";
    }
    else {
        let token = localStorage.getItem('token');
        let user = {};
        let xhttp = new XMLHttpRequest();
        xhttp.open('GET', '/get_user_data_by_token', true);
        xhttp.setRequestHeader('Authorization', token);
        xhttp.send();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4){
                if (this.status == 200) {
                    let answer = JSON.parse(xhttp.responseText);
                    user = answer.data;
                    let dataObject = {
                        email: user.email,
                        message: message_temp
                    }
                    xhttp = new XMLHttpRequest();
                    xhttp.open('POST', '/post_message', true);
                    xhttp.setRequestHeader('Authorization', token);
                    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                    xhttp.send(JSON.stringify(dataObject));
                    xhttp.onreadystatechange = function() {
                        if (this.readyState == 4) {
                            if (this.status == 201) {
                                document.getElementById("homemessagefield").value = "";
                                homeReloadWall();
                            } 
                            else if (this.status == 400){
                                document.getElementById("homefeedbackmessage").innerHTML = "You have entered invalid input!";
                            } 
                            else if (this.status == 401){
                                document.getElementById('homefeedbackmessage').innerHTML = "Your local token doesnt match with the one on our server!";
                            } 
                            else if (this.status == 500){
                                document.getElementById('homefeedbackmessage').innerHTML = "An internal error occured.";
                            } 
                        }
                    }
                }
                else if (this.status == 401){
                    document.getElementById('homeuserinfo').innerHTML = "Your local token doesnt match with the one on our server!";
                }
                else if (this.status == 500) {
                    document.getElementById('homeuserinfo').innerHTML = "An internal error occured.";
                }
            }
        }
    }
}

function browseSendMessage(data){
    document.getElementById('browsefeedbackmessage').innerHTML = "";
    let token = localStorage.getItem('token');
    let email_temp = document.getElementById('searchemail').value;
    let message_temp = data.messagefield.value;
    if (message_temp.length != 0){ 
        let dataObject = {
            email: email_temp,
            message: message_temp
        }
        let xhttp = new XMLHttpRequest();
        xhttp.open('POST', '/post_message', true);
        xhttp.setRequestHeader('Authorization', token);
        xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhttp.send(JSON.stringify(dataObject));
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status == 201) {
                    document.getElementById("browsemessagefield").value = "";
                    browseReloadWall();
                } 
                else if (this.status == 400){
                    document.getElementById("browsefeedbackmessage").innerHTML = "You have entered invalid input!";
                } 
                else if (this.status == 401){
                    document.getElementById('browsefeedbackmessage').innerHTML = "Your local token doesnt match with the one on our server!";
                } 
                else if (this.status == 500){
                    document.getElementById('browsefeedbackmessage').innerHTML = "An internal error occured.";
                } 
            }
        }
    }
    else{
        document.getElementById('browsefeedbackmessage').innerHTML = "Message field is empty!";
    }
}

function homeReloadWall(){
    document.getElementById("homemessagewall").innerHTML = "";
    let token = localStorage.getItem('token');
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', '/get_user_messages_by_token', true);
    xhttp.setRequestHeader('Authorization', token);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                let answer = JSON.parse(xhttp.responseText);
                let messagewall = answer.data;
            
                let size = messagewall.length
                for (let index in messagewall) {
                    let output = '<div id=' + index + ' draggable="true" ondragstart="drag(event)">' + messagewall[size-index-1][1] + ': ' + messagewall[size -index -1][0] + '</div>';
                    document.getElementById("homemessagewall").innerHTML += output;
                }
            }
            else if (this.status == 401){
                document.getElementById('homefeedbackmessage').innerHTML = "Your local token doesnt match with the one on our server!";
            }
            else if (this.status == 500){
                document.getElementById('homefeedbackmessage').innerHTML = "An internal error occured.";
            } 
        }
    }
}

function browseReloadWall(){
    document.getElementById("browsemessagewall").innerHTML = "";
    let token = localStorage.getItem('token');
    let email = document.getElementById('searchemail').value;
    let xhttp = new XMLHttpRequest();         
    let url = "/get_user_messages_by_email/" + email;

    xhttp.open("GET", url, true);
    xhttp.setRequestHeader('Authorization', token);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                document.getElementById('browsemessagediv').style.display = "block";
                let answer = JSON.parse(xhttp.responseText);
                let messagewall = answer.data;

                let size = messagewall.length
                for (let index in messagewall) {
                    let output = '<div id=' + index + ' draggable="true" ondragstart="drag(event)">' + messagewall[size-index-1][1] + ': ' + messagewall[size-index-1][0]+ '</div>';
                    document.getElementById("browsemessagewall").innerHTML += output;
                }
            }
            else {
                document.getElementById('browsemessagediv').style.display = "none";
                if (this.status == 401) {
                    document.getElementById('feedbacksearch').innerHTML = "Your local token doesnt match with the one on our server!";
                }
                else if (this.status == 404) {
                    document.getElementById('feedbacksearch').innerHTML = "User not found!";
                }
                else if (this.status == 500) {
                    document.getElementById('feedbacksearch').innerHTML = "An internal error occured.";
                }
            }
        }
    }
}

function searchUser(input) {
    let token = localStorage.getItem('token');
    let searchEmail = input.searchemail.value;
    let user = {};
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', '/get_user_data_by_token', true);
    xhttp.setRequestHeader('Authorization', token);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                let answer = JSON.parse(xhttp.responseText);
                user = answer.data;

                let userEmail = user.email;
                if (userEmail === searchEmail){
                    document.getElementById("feedbacksearch").innerHTML = "You cannot search your own email!";
                }
                else{
                    browseReloadWall();
                    displayBrowseInfo();
                }
            }

            else if (this.status == 401) {
                document.getElementById('homeuserinfo').innerHTML = "Your local token doesnt match with the one on our server!";
            }
            else if (this.status == 500) {
                document.getElementById('homeuserinfo').innerHTML = "An internal error occured.";
            }
        }
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.innerHTML);
}
  
function drophome(ev) {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
    document.getElementById('homemessagefield').value = data;
}

function dropbrowse(ev) {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
    document.getElementById('browsemessagefield').value = data;
}