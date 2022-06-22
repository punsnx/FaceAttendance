var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

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
    document.getElementById("navbt1").setAttribute("href", "http://127.0.0.1:8888");
    document.getElementById("navbt2").setAttribute("href", "http://127.0.0.1:8888/login");
    document.getElementById("navbt3").setAttribute("href", "http://127.0.0.1:8888/auth");
    document.getElementById("navbt4").setAttribute("href", ".");

}
function insertLoginDB(email, user, stdid, fname, lname, stdclass, stdroom, stdnumber, password) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("FaceAttendance");
      var myobj = { 
          Email: email, 
          User: user,
          StudentID: stdid,
          Fname: fname,
          Lname: lname,
          stdClass: stdclass,
          stdRoom: stdroom,
          stdNumber: stdnumber,
          Password: password
      };
      dbo.collection("customers").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        db.close();
      });
    });
  }
 