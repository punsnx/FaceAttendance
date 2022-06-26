console.log("it's Sirisuk");

function mainLoad() {

    console.log("runMainFunction");
    NavLoad();
}
function NavLoad() {
    document.getElementById("navbt1").innerHTML = "Home";
    document.getElementById("navbt2").innerHTML = "Sign in";
    document.getElementById("navbt3").innerHTML = "Sign up";
    document.getElementById("navbt4").innerHTML = "Profile";
    document.getElementById("navbt1").setAttribute("href", "/");
    document.getElementById("navbt2").setAttribute("href", "/login");
    document.getElementById("navbt3").setAttribute("href", "/auth");
    document.getElementById("navbt4").setAttribute("href", "/profile");

}

 