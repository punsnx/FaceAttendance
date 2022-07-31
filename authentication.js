var MongoClient = require("mongodb").MongoClient;
var url = process.env.CON_DB;

const { query } = require("express");
const express = require("express");

async function insertUser(req, res, hashedPassword) {
  const client = new MongoClient(url);
  const database = client.db("FaceAttendance");
  const usersCollection = database.collection("users");
  var check = [];
  const users = {
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
    password: hashedPassword,
    profileFile: undefined,
    role: "member",
  };
  const usersCheck = {
    name: req.body.authFname + " " + req.body.authLname,
    email: req.body.authEmail,
    username: req.body.authUsername,
    studentID: req.body.authStudentID,
  };
  for (let x in usersCheck) {
    cursor = usersCollection.find({ [x]: usersCheck[x] });
    if ((await cursor.count()) === 0) {
      console.log(x, "No documents found! can use!!!!!");
    } else {
      check.push(x);
    }
  }
  if (check.length == 0) {
    usersCollection.insertOne(users, async (err) => {
      if (err) throw err;
      console.log(users);
      console.log("1 user data inserted");
      await client.close();
    });
    res.render("pages/auth", {
      title: "authentication",
      alertauth: "Create Successfully",
      status: "success",
    });
  } else {
    res.render("pages/auth", {
      title: "authentication",
      alertauth: check,
      status: "error",
    });
  }
}
async function findDuplicateData(req, res) {}

module.exports = insertUser;
