var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017";

const { query } = require("express");
const express = require("express");

function insertUser(req, res, hashedPassword) {
    var users = {
        id: Date.now().toString(),
        name: req.body.authFname + " " + req.body.authLname,
        email: req.body.authEmail,
        username: req.body.authUsername,
        studentID: req.body.authStudentID,
        firstname: req.body.authFname,
        lastname: req.body.authLname,
        class: req.body.authClass,
        room: req.body.authRoom,
        no: req.body.authNumber,
        password: hashedPassword
    }; 
    MongoClient.connect(url, function (err, db) {
        if (err) throw err; 
        var dbo = db.db("FaceAttendance");
        dbo.collection("users").insertOne(users, function (err, res) {
          if (err) throw err;
          console.log(users);
          console.log("1 user data inserted");
          db.close();
        });
      });
    res.render("pages/auth", {
        title: "authentication",
        alertauth: "Create Successfully",
    });
}
function findDuplicateData(item, data) {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err; 
        var dbo = db.db("FaceAttendance");
        if (item == "email") {
        var query;
        } else if (item == "username") {
            query = { username: data };
            dbo.collection("users").find(query).toArray(function(err, result) {
                if (err) throw err;
                if (result != null) {
                    return item +" duplicates"
                } else {
                    return null
                }
            });
        } else if (item == "studentID") {
            query = { studentID: data };
            dbo.collection("users").find(query).toArray(function(err, result) {
                if (err) throw err;
                if (result != null) {
                    return item + " duplicates"
                } else {
                    return null
                }
            });
        } else if (item == "firstname") { 
            query = { studentID: data };
            dbo.collection("users").find(query).toArray(function(err, result) {
                if (err) throw err;
                if (result != null) {
                    return item + " duplicates"
                } else {
                    return null
                }
            });
        }
        db.close();
  });
}

module.exports = insertUser;