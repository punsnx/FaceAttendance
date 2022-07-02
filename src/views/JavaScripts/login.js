function onloadlogin() {
    document.getElementById("noAccountSignUp").setAttribute("href", "/auth");
    let sessionShowData = sessionStorage.getItem("sessShowData");
    if (sessionShowData == "true") {
        document.getElementById("showdata").innerHTML = sessionShowData;
    } else {
        document.getElementById("showdata").innerHTML = "false";
    }
    sessionStorage.clear();
}
function formSubmitLogin() {  

    sessionStorage.setItem("sessShowData", "true");
}
