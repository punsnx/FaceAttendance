const MongoClient = require("mongodb").MongoClient;
const url = process.env.CON_DB;
const moment = require("moment");
const client = new MongoClient(url);
const database = client.db("FaceAttendance");
const users = database.collection("users");
const attendance = database.collection("Attendance");
const lastlogin = database.collection("LastLogin");

exports.editEachAttendance = async (req, res) => {
  const currentState = req.params.currentState;
  const newState = req.params.newState;
  const studentID = req.params.studentID;
  var name = req.params.name;
  name = name.replace("-", " ");
  var dateSearch = req.params.dateSearch;
  dateSearch = dateSearch.split("-");
  var days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  var attendanceRef = {
    studentID: studentID,
    name: name,
    timestamp: {
      date: dateSearch[2],
      month: dateSearch[1],
      year: dateSearch[0],
      hour: moment().format("hh"),
      minute: moment().format("mm"),
      second: moment().format("ss"),
      millisecond: moment().format("SSS"),
      apm: moment().format("a"),
      day: moment().format("dddd"),
    },
  };
  var query = {
    $and: [
      { studentID: studentID },
      { name: name },
      { "timestamp.date": dateSearch[2] },
      { "timestamp.month": dateSearch[1] },
      { "timestamp.year": dateSearch[0] },
    ],
  };
  console.log(dateSearch);
  if (newState == currentState) {
  } else if (newState == "Checked") {
    if (currentState == "Absent") {
      attendanceRef.timestamp.hour = "08";
      attendanceRef.timestamp.minute = "00";
      attendanceRef.timestamp.second = "00";
      attendanceRef.timestamp.millisecond = "000";
      attendanceRef.timestamp.apm = "AM";
      attendanceRef.timestamp.day =
        days[new Date(dateSearch[0], dateSearch[1], dateSearch[2]).getDay()];
      attendance.insertOne(attendanceRef);
    } else {
      attendance.updateOne(query, {
        $set: {
          "timestamp.hour": "08",
          "timestamp.minute": "00",
          "timestamp.second": "00",
          "timestamp.millisecond": "000",
          "timestamp.apm": "AM",
          "timestamp.day":
            days[
              new Date(dateSearch[0], dateSearch[1], dateSearch[2]).getDay()
            ],
        },
      });
    }
  } else if (newState == "Late") {
    if (currentState == "Absent") {
      attendanceRef.timestamp.hour = "09";
      attendanceRef.timestamp.minute = "00";
      attendanceRef.timestamp.second = "00";
      attendanceRef.timestamp.millisecond = "000";
      attendanceRef.timestamp.apm = "AM";
      attendanceRef.timestamp.day =
        days[new Date(dateSearch[0], dateSearch[1], dateSearch[2]).getDay()];
      attendance.insertOne(attendanceRef);
    } else {
      attendance.updateOne(query, {
        $set: {
          "timestamp.hour": "09",
          "timestamp.minute": "00",
          "timestamp.second": "00",
          "timestamp.millisecond": "000",
          "timestamp.apm": "AM",
          "timestamp.day":
            days[
              new Date(dateSearch[0], dateSearch[1], dateSearch[2]).getDay()
            ],
        },
      });
    }
  } else if (newState == "Absent") {
    if (currentState == "Absent") {
    } else {
      attendance.deleteMany(query);
    }
  }
  res.send({ processState: "" });
};
