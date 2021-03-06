var admin = require("../functions/firebase").admin;
var express = require("express");
var router = express.Router();

const mysql = require("mysql");
const dbconfig = require("../config/database.js");
const db = mysql.createConnection(dbconfig);

const multer = require("multer");
const multerconfig = require("../config/multer.js");
storage = multer.diskStorage(multerconfig);



router.get("/", (req, res) => {

  var id = req.query.userId;
  var token = req.query.token;
  var name = "";
  var group_id = "";
  var image = "";
  var birth = "";
  var phone = "";
  var email = "";
  var token = "";
  var gender;
  var resultCode = 404;
  var message = "에러 발생";

  async function queryData() {
    var sqlUpdate = "UPDATE homekippa.User SET token = ? WHERE id = ?";
    var sqlSelect = "SELECT * FROM homekippa.User WHERE id = ?";

    db.query(sqlUpdate, [token, id], (err, result) => {
      if(err){
        console.log(err);
      } else {
        db.query(sqlSelect, id, (err, result) => {
          if (err) {
            console.log(err);
            res.json({
              code: resultCode,
              message: message,
            })
          } else {
            if(result == ""){
              res.json({
                code: resultCode,
                message: message,
              })
            }
            else{
              resultCode = 200;
              message = "유저정보 GET 성공";
              name = result[0].name;
              group_id = result[0].group_id;
              image = result[0].image;
              var date = new Date(result[0].birth);
              date.setHours(date.getHours()+9);
              birth = date;
              phone = result[0].phone;
              email = result[0].email;
              gender = result[0].gender;
              res.json({
                code: resultCode,
                message: message,
                name,
                id,
                group_id,
                image,
                birth,
                phone,
                email,
                gender,
                token
              });
            }          
          }
        });
      }
    });
  }

  queryData();
});

router.post("/add", (req, res) => {
  var name = req.body.userName;
  var id = req.body.userId;
  var phone = "+82" + req.body.userPhone;
  var email = req.body.userEmail;
  var birth = req.body.userBirth;
  var gender = req.body.userGender;
  var image =
  "./images/" + "group_profile_default.jpg";
  var resultCode = 404;
  var message = "에러 발생";

  insertData();

  async function insertData() {
    var sql =
      "INSERT INTO User (id, name, phone, email, birth, image, gender) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [id, name, phone, email, birth, image, gender], (err, result) => {
      if (err) {
        console.log(err);
        admin.auth().deleteUser(id);
        done();
      } else {
        resultCode = 200;
        message = "회원가입 성공";
        done();
      }
    });
  }
  function done() {
    res.json({
      code: resultCode,
      message: message,
    });
  }
});

router.post("/add/photo", multer({
  storage: storage,
}).single("upload"), (req, res) => {
  var name = req.body.userName;
  var id = req.body.userId;
  var phone = "+82" + req.body.userPhone;
  var email = req.body.userEmail;
  var birth = req.body.userBirth;
  var gender = req.body.userGender;
  var image = "./images/" + req.file.filename;
  var resultCode = 404;
  var message = "에러 발생";

  insertData().then(function () {
    //  console.log(req.body);
    res.json({
      code: resultCode,
      message: message,
    });
  });

  async function insertData() {
    var sql =
      "INSERT INTO User (id, name, phone, email, birth, image, gender) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [id, name, phone, email, birth, image, gender], (err, result) => {
      if (err) {
        console.log(err);
        admin.auth().deleteUser(id);
      } else {
        resultCode = 200;
        message = "회원가입 성공";
      }
    });
  }
});

router.put("/delete", (req, res) => {
  var userId = req.query.userId;
  var resultCode = 404;
  var message = "회원 탈퇴 에러 발생";
  deleteData();

  async function deleteData() {
    var sql =
      "DELETE FROM User WHERE id = '" + userId+"'";
    db.query(sql,(err, result) => {
      if (err) {
        console.log(err);
      } else {
        if(result.affectedRows == 0){
          done();
        }
        else{
          resultCode = 200;
          message = "회원 탈퇴 성공";
          done();
        }
      }
    });
  }
  function done() {

    res.json({
      code: resultCode,
      message: message,
    });
  }
});

router.post("/update", (req, res) => {

  var id = req.body.id;
  var name = req.body.name;
  var phone = req.body.phone;
  var image = "./images/" + "group_profile_default.jpg";
  var checkDefault = req.body.checkDefault;
  if (checkDefault == 0) {
    var sqlUpdate =
    "UPDATE homekippa.User SET name ='"+name+"', phone = '"+phone+"' WHERE id = '"+id+"' ;";
  } else {
    var sqlUpdate =
    "UPDATE homekippa.User SET name ='"+name+"', phone = '"+phone+"', image = '"+image+"' WHERE id = '"+id+"' ;";
  }

  console.log(id, name, phone, checkDefault, sqlUpdate);
  var resultCode = 404;
  var message = "일과 수정 에러 발생";

  async function updateData() {
    console.log("왔나용가리?")

    db.query(
      sqlUpdate,
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resultCode = 200;
          message = "일과 수정 성공";
          editUser();
        }
      }
    );
  }
  updateData();
  function editUser() {
    res.json({
      code: resultCode,
      message: message,
    });
  }
});

router.post("/update/photo", multer({
  storage: storage,
}).single("upload"), (req, res) => {

  var id = req.body.id;
  var name = req.body.name;
  var phone = req.body.phone;
  var image = "./images/" + req.file.filename;

  console.log(id, name, phone);
  var resultCode = 404;
  var message = "일과 수정 에러 발생";

  async function updateData() {
    console.log("왔나용가리?")
    var sqlUpdate =
    "UPDATE homekippa.User SET name ='"+name+"', phone = '"+phone+"', image = '"+image+"' WHERE id = '"+id+"' ;";
    db.query(
      sqlUpdate,
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resultCode = 200;
          message = "일과 수정 성공";
          editUser();
        }
      }
    );
  }
  updateData();
  function editUser() {
    res.json({
      code: resultCode,
      message: message,
    });
  }
});

router.get("/group", (req, res) => {
  var id = req.query.groupId;
  var resultCode = 404;
  var message = "에러 발생";

  async function queryData() {
    var sqlSelect = "SELECT * FROM homekippa.User WHERE group_id = ?";
    db.query(sqlSelect, id, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("result: ", result);
        resultCode = 200;
        message = "사용자 정보 GET 성공";

        res.json(result);
      }
    });
  }

  queryData();
});

router.get("/list/filter", (req, res) => {
  var filter = '%' + req.query.searchFilter + '%';
  var resultCode = 404;
  var message = "에러 발생";

  console.log(filter);
  async function queryData() {
    var sqlSelect = "SELECT * FROM homekippa.User WHERE ((name LIKE ?) OR (phone LIKE ?) OR (email LIKE ?))";
    db.query(sqlSelect, [filter, filter, filter], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("result: ", result);
        resultCode = 200;
        message = "사용자 정보 GET 성공";

        res.json(result);
      }
    });
  }

  queryData();
});

router.get("/getNoti", (req, res) => {
  var id = req.query.userId;

  async function queryData() {
    var sqlSelect = "SELECT * FROM Alarm WHERE to_id = ?;";
    db.query(sqlSelect, id, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log("result: ", result);

        res.json(result);
      }
    });
  }

  queryData();
});

module.exports = router;
