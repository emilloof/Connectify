function displayProfile(){
    console.log("display");
    let token = localStorage.getItem('token');
    if(token != null){
        let ws = new WebSocket("ws://localhost:5000/echo");

        ws.onopen = function() {
            ws.send(token);
        };

        ws.onmessage = function(event) {
            if (event.data === "You have been logged out due to login from another browser.") {
                forcedSignOut();
            }
        };
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

        //let answer = serverstub.signIn(username, password);
        let dataObject = {
            username: input.loginemail.value,
            password: password_temp
        } 
        let xhttp = new XMLHttpRequest();
        xhttp.open('POST', '/sign_in', true);
        xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhttp.send(JSON.stringify(dataObject));
        xhttp.onreadystatechange = function() {
            if (this.status == 200 && this.readyState == 4) {
                let answer = JSON.parse(xhttp.responseText);

                if(answer.success) {
                    let token = answer.data;
                    localStorage.setItem('token', token);
                    displayProfile();
                }
                else {
                    document.getElementById('feedbackLogin').innerHTML = answer.message;
                }
            }
            else{
                document.getElementById('feedbackLogin').innerHTML = "Internal"
            }
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
            //let answer = serverstub.signUp(dataObject);
            
            /*
            NEW CODE FOR LAB 3
            */

            let xhttp = new XMLHttpRequest();
            xhttp.open('POST', '/sign_up', true);
            xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhttp.send(JSON.stringify(dataObject));
            xhttp.onreadystatechange = function() {
                if (this.status == 200 && this.readyState == 4) {
                    let answer = JSON.parse(xhttp.responseText);
                    document.getElementById('feedbackSignUp').innerHTML = answer.message;
                }
            }
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
            // let answer = serverstub.changePassword(token, oldPassword, newPassword)
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
                if (this.status == 200 && this.readyState == 4) {
                    let answer = JSON.parse(xhttp.responseText);
                    document.getElementById('feedbackChange').innerHTML = answer.message;
                }   
            }
        }
    }
    catch(e){
        document.getElementById('feedbackChange').innerHTML = e.message;
    }
}

function signOut(){
    let token = localStorage.getItem('token');
    //let answer = serverstub.signOut(token);
    let xhttp = new XMLHttpRequest();
    xhttp.open('DELETE', '/sign_out', true);
    xhttp.setRequestHeader('Authorization', token);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status === 200) {
                let answer = JSON.parse(xhttp.responseText);
                localStorage.removeItem('token'); 
                localStorage.removeItem('email');
                displayProfile();
                document.getElementById('feedbackLogin').innerHTML = answer.message
            }
        }
    }
}

function forcedSignOut(){
    let token = localStorage.getItem('token');
    //let answer = serverstub.signOut(token);
    let xhttp = new XMLHttpRequest();
    xhttp.open('DELETE', '/forced_sign_out', true);
    xhttp.setRequestHeader('Authorization', token);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status === 200) {
                let answer = JSON.parse(xhttp.responseText);
                localStorage.removeItem('token'); 
                localStorage.removeItem('email');
                displayProfile();
                document.getElementById('feedbackLogin').innerHTML = answer.message
            }
        }
    }
}

function displayHomeInfo(){
    let token = localStorage.getItem('token');
    //let user = serverstub.getUserDataByToken(token).data;
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', '/get_user_data_by_token', true);
    xhttp.setRequestHeader('Authorization', token);
  //  xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.status == 200 && this.readyState == 4) {
            let answer = JSON.parse(xhttp.responseText);
            let user = answer.user;
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
    }
}

function displayBrowseInfo(){
    let token = localStorage.getItem('token');
    let email = localStorage.getItem('email');
    //let user = serverstub.getUserDataByEmail(token, email).data;
    let xhttp = new XMLHttpRequest();         
    let url = "/get_user_data_by_email/" + email;
    xhttp.open("GET", url, true);
    xhttp.setRequestHeader('Authorization', token);
  //  xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.status == 200 && this.readyState == 4) {
            let answer = JSON.parse(xhttp.responseText);
            let user = answer.user;
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
    }
}


function homeSendMessage(data){
    document.getElementById('homefeedbackmessage').innerHTML = "";
    let token = localStorage.getItem('token');
    //let user = serverstub.getUserDataByToken(token).data;
    let user = {};
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', '/get_user_data_by_token', true);
    xhttp.setRequestHeader('Authorization', token);
  //  xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.status == 200 && this.readyState == 4) {
            let answer = JSON.parse(xhttp.responseText);
            user = answer.user;
            let message_temp = data.messagefield.value;
            if(message_temp.length != 0){
                //let answer = serverstub.postMessage(token, message, email);
                let dataObject = {
                    email: user.email,
                    message: message_temp
                }
                let xhttp = new XMLHttpRequest();
                xhttp.open('POST', '/post_message', true);
                xhttp.setRequestHeader('Authorization', token);
                xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                xhttp.send(JSON.stringify(dataObject));
                xhttp.onreadystatechange = function() {
                    if (this.status == 200 && this.readyState == 4) {
                        let answer = JSON.parse(xhttp.responseText);
                        if (answer.success){
                            document.getElementById("homemessagefield").value = "";
                            homeReloadWall();
                        }
                        else{
                            document.getElementById('homefeedbackmessage').innerHTML = answer.message
                        }
                    }
                }
            }
            else{
                document.getElementById('homefeedbackmessage').innerHTML = "Message field is empty!";
            }
        }
    }
    

    
}

function browseSendMessage(data){
    document.getElementById('browsefeedbackmessage').innerHTML = "";
    let token = localStorage.getItem('token');
    let email_temp = localStorage.getItem('email');
    let message_temp = data.messagefield.value;
    if(message_temp.length != 0){ 
        let dataObject = {
            email: email_temp,
            message: message_temp
        }
    //    let answer = serverstub.postMessage(token, message, email);
        let xhttp = new XMLHttpRequest();
        xhttp.open('POST', '/post_message', true);
        xhttp.setRequestHeader('Authorization', token);
        xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhttp.send(JSON.stringify(dataObject));
        xhttp.onreadystatechange = function() {
            if (this.status == 200 && this.readyState == 4) {
                let answer = JSON.parse(xhttp.responseText);
                if (answer.success){
                    document.getElementById("browsemessagefield").value = "";
                    browseReloadWall();
                }
                else{
                    document.getElementById('browsefeedbackmessage').innerHTML = answer.message
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
    //let messagewall = (serverstub.getUserMessagesByToken(token)).data;
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', '/get_user_messages_by_token', true);
    xhttp.setRequestHeader('Authorization', token);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.status == 200 && this.readyState == 4) {
            let answer = JSON.parse(xhttp.responseText);
            let messagewall = answer.data;
           
            let size = messagewall.length
            for (let index in messagewall) {
                let output = '<div>' + messagewall[size-index-1][1] + ': ' + messagewall[size -index -1][0] + '</div>';
                document.getElementById("homemessagewall").innerHTML += output;
            }
                
        }
    }
}

function browseReloadWall(){
    document.getElementById("browsemessagewall").innerHTML = "";
    let token = localStorage.getItem('token');
    let email = localStorage.getItem('email');
    //let messagewall = (serverstub.getUserMessagesByEmail(token, email)).data;

    let xhttp = new XMLHttpRequest();         
    let url = "/get_user_messages_by_email/" + email;

    xhttp.open("GET", url, true);
    xhttp.setRequestHeader('Authorization', token);
    //xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.status == 200 && this.readyState == 4) {
            let answer = JSON.parse(xhttp.responseText);
            let messagewall = answer.data;

            let size = messagewall.length
            for (let index in messagewall) {
                let output = '<div>' + messagewall[size-index-1][1] + ': ' + messagewall[size-index-1][0]+ '</div>';
                document.getElementById("browsemessagewall").innerHTML += output;
            }
        }
    }
}

function searchUser(input){
    let token = localStorage.getItem('token');
    let searchEmail = input.searchemail.value;
    //let user = serverstub.getUserDataByToken(token).data;
    let user = {};
    let xhttp = new XMLHttpRequest();
    xhttp.open('GET', '/get_user_data_by_token', true);
    xhttp.setRequestHeader('Authorization', token);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.status == 200 && this.readyState == 4) {
            let answer = JSON.parse(xhttp.responseText);
            user = answer.user;

        
            let userEmail = user.email;

           // document.getElementById("feedbacksearch").innerHTML = "";
            if (userEmail === searchEmail){
                document.getElementById("feedbacksearch").innerHTML = "You cannot search your own email!";
            }
        
        
            else{
                let xhttp = new XMLHttpRequest();         
                let url = "/get_user_messages_by_email/" + searchEmail;

                xhttp.open("GET", url, true);
                xhttp.setRequestHeader('Authorization', token);
                //xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                
                xhttp.send();
                xhttp.onreadystatechange = function() {
                    if (this.readyState === 4) {  // Ensure it's the final state (request completed)
                        if (this.status === 200) {
                            let answer = JSON.parse(xhttp.responseText);

                            if (answer.success){
                                document.getElementById('browsemessagediv').style.display = "block";
                                document.getElementById("feedbacksearch").innerHTML = "";

                                localStorage.setItem('email', searchEmail);
                                displayBrowseInfo();
                                browseReloadWall();
                            }
                            else {
                                // If the status code is anything other than 200, show an error
                                document.getElementById("feedbacksearch").innerHTML = "Email does not exist!";
                                document.getElementById('browsemessagediv').style.display = "none";
                            
                        } 
                        }
                    }
                }
            }
        
        }
        
    }
}