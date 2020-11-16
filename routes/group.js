var express = require("express");
var router = express.Router();
var path = require("path");

const mysql = require("mysql");
const dbconfig = require("../config/database.js");
const db = mysql.createConnection(dbconfig);

const multer = require("multer");
const multerconfig = require("../config/multer.js");
storage = multer.diskStorage(multerconfig);

router.get("/", (req, res) => {
  var id = req.query.groupId;
  var resultCode = 404;
  var message = "에러 발생";

  async function queryData() {
    var sqlSelect = "SELECT * FROM homekippa.Group WHERE id = ?";
    db.query(sqlSelect, id, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result[0]);
        resultCode = 200;
        message = "그룹 정보 GET 성공";

        res.json({
          code: resultCode,
          message: message,
          name: result[0].name,
          id: result[0].id,
          image: result[0].image,
          address: result[0].address,
          introduction: result[0].introduction,
          background: result[0].background,
          tag: result[0].tag,
        });
      }
    });
  }

  queryData().then(function () {
    console.log(id);
  });
});

router.post("/invite", (req, res) => {
  var from_group = req.body.from_group;
  var to_user = req.body.to_user;

  async function insertData(group, user) {
    var checksql =
      "SELECT COUNT(IF(from_group = ? AND to_user = ?, 1, null)) AS count FROM GroupInvite";
    db.query(checksql, [group, user], (err, result) => {
      if (err) {
        res.send({ result: false });
        console.log("초대 전송 실패");
      } else if (result[0].count > 0) {
        res.send({ result: true });
        console.log("초대 전송 성공");
      } else {
        var sql = "INSERT INTO GroupInvite (from_group, to_user) VALUES (?, ?)";
        db.query(sql, [group, user], (err, _) => {
          if (err) {
            res.send({ result: false });
            console.log("초대 전송 실패");
          } else {
            res.send({ result: true });
            console.log("초대 전송 성공");
          }
        });
      }
    });
  }

  insertData(from_group, to_user);
});

router.get("/image", (req, res) => {
  console.log(req.path);
  var filePath = req.path;

  fs.readFile(filePath, (err, data) => {	
      if(err){
        console.log(err);
        res.end(null);
      } else {
      console.log(filePath);
      console.log(data);
      res.end(data);
      }
    }
  );

});

router.post(
  "/add/photo",
  multer({
    storage: storage,
  }).single("upload"),
  (req, res) => {
    var id = req.body.userId;
    var name = req.body.groupName;
    var tag = createTag();
    var image = path.join(__dirname, "..", "images/") + req.file.filename;
    var address = req.body.groupAddress;
    // 배경사진 var background = req.body.groupBackground;
    var introduction = req.body.groupIntroduction;
    var resultCode = 404;
    var message = "에러 발생";

    function createTag() {
      return (randomTag = Math.floor(Math.random() * 10000));
    }

    async function checkDuplication() {
      var checkCode = true;

      while (checkCode) {
        checkCode = searchTag();
        if (checkCode) {
          tag = createTag();
        } else {
          insertData();
        }
      }
    }

    function searchTag() {
      var sqlSelect =
        "SELECT tag FROM homekippa.Group WHERE name = ? and tag = ?";
      db.query(sqlSelect, [name, tag], (err, result) => {
        if (err) {
          console.log(err);
          return false;
        } else if (result[0]) {
          return true;
        } else {
          return false;
        }
      });
    }

    function insertData() {
      var sqlInsert =
        "INSERT INTO homekippa.Group (name, tag, image, address, introduction) VALUES (?, ?, ?, ?, ?)";
      db.query(
        sqlInsert,
        [name, tag, image, address, introduction],
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            updateData(result.insertId);
          }
        }
      );
    }

    function updateData(groupId) {
      var sqlUpdate = "UPDATE homekippa.User SET group_id = ? WHERE id = ?";
      db.query(sqlUpdate, [groupId, id], (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resultCode = 200;
          message = "그룹생성 성공";
          send();
        }
      });
    }

    function send() {
      console.log(req.file);
      console.log(req.body);
      res.json({
        code: resultCode,
        message: message,
      });
    }

    checkDuplication();
  }
);

router.post("/add", (req, res) => {
    var id = req.body.userId;
    var name = req.body.groupName;
    var tag = createTag();
    var image = path.join(__dirname, "..", "images/") + "profile.png";
    var address = req.body.groupAddress;
    // 배경사진 var background = req.body.groupBackground;
    var introduction = req.body.groupIntroduction;
    var resultCode = 404;
    var message = "에러 발생";

    function createTag() {
      return (randomTag = Math.floor(Math.random() * 10000));
    }

    async function checkDuplication() {
      var checkCode = true;

      while (checkCode) {
        checkCode = searchTag();
        if (checkCode) {
          tag = createTag();
        } else {
          insertData();
        }
      }
    }

    function searchTag() {
      var sqlSelect =
        "SELECT tag FROM homekippa.Group WHERE name = ? and tag = ?";
      db.query(sqlSelect, [name, tag], (err, result) => {
        if (err) {
          console.log(err);
          return false;
        } else if (result[0]) {
          return true;
        } else {
          return false;
        }
      });
    }

    function insertData() {
      var sqlInsert =
        "INSERT INTO homekippa.Group (name, tag, image, address, introduction) VALUES (?, ?, ?, ?, ?)";
      db.query(
        sqlInsert,
        [name, tag, image, address, introduction],
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            updateData(result.insertId);
          }
        }
      );
    }

    function updateData(groupId) {
      var sqlUpdate = "UPDATE homekippa.User SET group_id = ? WHERE id = ?";
      db.query(sqlUpdate, [groupId, id], (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resultCode = 200;
          message = "그룹생성 성공";
          send();
        }
      });
    }

    function send() {
      console.log(req.body);
      res.json({
        code: resultCode,
        message: message,
      });
    }

    checkDuplication();
  }
);

module.exports = router;
