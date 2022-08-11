const resData = require("./httpStorage");

const MongoClient = require("mongodb").MongoClient;
const url = process.env.CON_DB;
const client = new MongoClient(url);
const database = client.db("FaceAttendance");
const users = database.collection("users");
const lastLogin = database.collection("LastLogin");
exports.computeLastLogin = async (req, res) => {
  const query = {};
  const options = {
    sort: { _id: -1 },
    projection: { _id: 0, studentID: 1, name: 1, timestamp: 1 },
  };
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("FaceAttendance");
    dbo
      .collection("LastLogin")
      .find(query, options)
      .limit(5)
      .toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
        res.send({ lastlogin: result });
        db.close();
      });
  });
};

exports.computeIndex = async (req, res) => {
  const query = {};
  const options = {
    sort: { studentID: 1 },
    projection: { _id: 0, studentID: 1 },
  };
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("FaceAttendance");
    dbo
      .collection("LastLogin")
      .find(query, options)
      .toArray(function (err, result) {
        if (err) throw err;
        var r = [];
        var exChartData = [["userLogin", "frequency"]];
        for (var i = 0; i < result.length; i++) {
          r.push(result[i].studentID);
        }
        const counts = {};
        r.forEach((x) => {
          counts[x] = (counts[x] || 0) + 1;
        });
        for (j in counts) {
          exChartData.push([j, counts[j]]);
        }
        res.send({ chart: exChartData });
        db.close();
      });
  });
};

exports.computeUsersClassCount = async (req, res) => {
  // CLASS
  const query = {};
  const options = {
    sort: { sort: 1 },
    projection: { _id: 0, class: 1 },
  };
  const cursor = users.find(query, options);
  const result = await cursor.toArray();
  var classArr = [];
  for (var i = 0; i < result.length; i++) {
    classArr.push(result[i].class);
  }
  const counts = {};
  classArr.forEach((x) => {
    counts[x] = (counts[x] || 0) + 1;
  });
  var items = [];
  //ROOM
  var cursorRoom;
  var resultRoom;
  var roomArr = [];
  var countsRoom;
  for (x in counts) {
    cursorRoom = users.find(
      { class: x },
      {
        sort: { sort: 1 },
        projection: { _id: 0, room: 1 },
      }
    );
    resultRoom = await cursorRoom.toArray();
    for (var i = 0; i < resultRoom.length; i++) {
      roomArr.push(resultRoom[i].room);
    }
    countsRoom = {};
    roomArr.forEach((x) => {
      countsRoom[x] = (countsRoom[x] || 0) + 1;
    });
    //ITEMS
    items.push({ class: x, room: countsRoom });
  }

  console.log(counts, items);
  res.send({ classitems: items });
};
exports.computeDataHistoryStudentList = async (req, res) => {
  console.log(
    "================================================================"
  );
  console.log(req.params.class, req.params.room);
  const query = {
    $and: [{ class: req.params.class }, { room: req.params.room }],
  };
  const options = {
    sort: { no: 1 },
    projection: {
      _id: 0,
      name: 1,
      firstname: 1,
      lastname: 1,
      studentID: 1,
      class: 1,
      room: 1,
      no: 1,
      profileFile: 1,
    },
  };

  const cursor = users.find(query, options);
  var result = await cursor.toArray();
  try {
    result.forEach((info) => {
      if (info.profileFile != undefined) {
        info.profileFile =
          req.protocol +
          "://" +
          req.header("host") +
          "/storage/user_profile/" +
          info.profileFile;
      } else {
        info.profileFile = "IMG/noimg.jpeg";
      }
    });
  } catch {
    console.error();
  }
  console.log(result);
  res.send({ studentList: result });
};
