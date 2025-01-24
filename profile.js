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

window.onload = function() {
    document.getElementById("default").click();
    displayUserInfo();
};

//DUBLICATE
function isLongPassword(password) {
    if (password.length < 8) {
        return false;
    }
    return true;
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
    localStorage.setItem('token', null); //maybe use "" instead of null
    displayProfile();
    document.getElementById('feedbackLogin').innerHTML = answer.message;
}

/*_____________________________________________part 8_____________________ */

function displayUserInfo(){
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

function sendMessage(data){
    
    let token = localStorage.getItem('token');
    let user = serverstub.getUserDataByToken(token).data;
    let email = user.email;
    let message = data.messagefield.value;
    let answer = serverstub.postMessage(token, message, email);
    if (answer.success){
        reloadWall();
    }
}

function reloadWall(){
    document.getElementById("messagewall").innerHTML = "";
    let token = localStorage.getItem('token');
    let messagewall = (serverstub.getUserMessagesByToken(token)).data;
    for (let index in messagewall) {
        let output = '<div>' + messagewall[index].writer + ': ' + messagewall[index].content + '</div>';
        document.getElementById("messagewall").innerHTML += output;
    }
}