const fs = require('fs')

function resData(req, res) {
  fs.readFile(__dirname + "/src/views/IMG/user_profile/" + req.params.path , function (err,data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
}
module.exports = resData;