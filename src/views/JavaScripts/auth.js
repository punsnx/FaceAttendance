

function onloadauth() {
    document.getElementById("haveAccountLogin").setAttribute("href", "http://127.0.0.1:8888/login");
    let sessionShowDataA = sessionStorage.getItem("sessShowDataA");
    if (sessionShowDataA == "true") {
        document.getElementById("showdataA").innerHTML = sessionShowDataA;
    } else {
        document.getElementById("showdataA").innerHTML = "false";
    }
    sessionStorage.clear();
}
function formSubmitAuth() {




    sessionStorage.setItem("sessShowDataA", "true");
}