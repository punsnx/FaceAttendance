console.log("it's Sirisuk");

function mainLoad() {
    console.log("runMainFunction");
    NavLoad();
}
function NavLoad() {
    document.getElementById("navbt1").innerHTML = "Home";
    document.getElementById("navbt2").innerHTML = "Sign in";
    document.getElementById("navbt3").innerHTML = "Sign up";
    document.getElementById("navbt4").innerHTML = "About";
    document.getElementById("navbt1").setAttribute("href", "/index.html")
    document.getElementById("navbt2").setAttribute("href", "/login.html")
    document.getElementById("navbt3").setAttribute("href", "/auth.html")
    document.getElementById("navbt4").setAttribute("href", ".")
}


