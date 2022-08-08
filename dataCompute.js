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
  const query = {};
  const options = {
    sort: { sort: 1 },
    projection: { _id: 0, class: 1 },
  };
  const cursor = users.find(query, options);
  const result = await cursor.toArray();
  var r = [];
  for (var i = 0; i < result.length; i++) {
    r.push(result[i].class);
  }
  const counts = {};
  r.forEach((x) => {
    counts[x] = (counts[x] || 0) + 1;
  });
  var items = [];
  for (x in counts) {
    items.push({ key: x, value: x, count: counts[x] });
  }

  console.log(counts, items);
  res.send({ classitems: items });
};
