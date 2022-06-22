const express = require('express');
const app = express();
const debug = require('debug');
const chalk = require('chalk');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const port = process.env.port;

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";


app.use(morgan("combined"));

app.set("views", "./src/views")
app.set ( "view engine", "ejs" );
app.use("/CSS", (express.static(__dirname + "/src/views/CSS" )))
app.use("/JS", (express.static(__dirname + "/src/views/JavaScripts" )))
app.use(express.urlencoded({ extended: false }))

app.get( "/", (req,res) =>{
		res.render("pages/index",{title: "home"});		
})
app.get( "/login", (req,res) =>{
	res.render("pages/login",{title: "login"});		
})
app.get( "/auth", (req,res) =>{ 
	res.render("pages/auth",{title: "authentication", alertauth: []});		
})
app.post("/login", (req,res) =>{
  res.render("pages/login",{title: "login"});		
})
app.post("/auth", (req,res) =>{
  var Aemail = req.body.authEmail;
  var Ausername = req.body.authUsername;
  var Astdid = req.body.authStudentID;
  var Afname = req.body.authFname;
  var Alname = req.body.authLname;
  var Astdclass = req.body.authClass;
  var Astdroom = req.body.authRoom;
  var Astdnumber = req.body.authNumber;
  var Apassword = req.body.authPassword;
  var Acfpassword = req.body.authCFPassword;

  if (Apassword != Acfpassword) {
    res.render("pages/auth",{title: "authentication", alertauth: "Password not same"});	
    console.log("Password not same"); 

  }
  const user =  {
    email: Aemail,
    username: Ausername,
    studentID: Astdid,
    Firstname: Afname,
    Lastname: Alname,
    Class: Astdclass,
    Room: Astdroom,
    No: Astdnumber,
    Password: Apassword
  }
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("FaceAttendance");
    dbo.collection("users").insertOne(user, function(err, res) {
      if (err) throw err;
      console.log("1 user data inserted");
      console.log(user);
      db.close();
    });
  });
  res.render("pages/auth",{title: "authentication", alertauth: "Successfully"});	
  console.log("PASS"); 
})


app.listen(port, function () {
    console.log(
      "Express server listening on port %d  http://localhost:%d/",
      this.address().port, this.address().port
    );
  });


