var express = require("express");
var router = express.Router();

const mysql = require("mysql");
const dbconfig = require("../config/database.js");
const { post } = require("request");
const db = mysql.createConnection(dbconfig);

var path = require("path");
const multer = require("multer");
const multerconfig = require("../config/multer.js");
const { group } = require("console");
storage = multer.diskStorage(multerconfig);

router.get("/group", (req, res) => {
  var id = req.query.groupId;
  var postList = [];
  var likeList = [];
  var resultCode = 404;
  var message = "에러 발생";

  function queryData() {
    var sqlSelect =
      "SELECT * FROM homekippa.Post WHERE group_id = ? ORDER BY date DESC";
    return new Promise(function (resolve, reject) {
      db.query(sqlSelect, id, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  function delay(item, sql, id) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        db.query(sql, id, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            resolve(result);
          }
        });
      }, 1);
    });
  }
  async function getLikeData(list) {
    var temp_list = [];

    var sql = "SELECT * FROM homekippa.Like WHERE post_id = ? ";
    for (var i = 0; i < list.length; i++) {
      var t = await delay(list[i], sql, list[i].id);
      temp_list.push(t);
    }
    return temp_list;
  }

  queryData()
    .then(function (data) {
      postList = data;
      return data;
    })
    .then(function (data) {
      postList = data;
      console.log("group postlist");
      console.log(postList);
      likeList = getLikeData(data);
      return likeList;
    })
    .then(function (data) {
      likeList = data;
      console.log("group likeList");
      console.log(likeList);
      resultCode = 200;
      message = "그룹 게시글 GET 성공";
      res.json({ likeData: likeList, postData: postList });
    });
});

router.get("/home", (req, res) => {
  var groupid = req.query.groupId;
  var tab = req.query.tab_;
  var area = req.query.area;
  console.log(tab);
  var postList = [];
  var groupList = [];
  var likeList = [];
  var resultCode = 404;
  var message = "에러 발생";

  function getPostData(sql) {
    return new Promise(function (resolve, reject) {
      db.query(sql, groupid, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  function delay(item, sql, id) {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        db.query(sql, id, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            resolve(result);
          }
        });
      }, 1);
    });
  }
  async function getGroupData(list) {
    var temp_list = [];
    var sql = "SELECT * FROM homekippa.Group WHERE id = ? ";
    for (var i = 0; i < list.length; i++) {
      var t = await delay(list[i], sql, list[i].group_id);
      temp_list.push(t[0]);
    }
    return temp_list;
  }

  async function getLikeData(list) {
    var temp_list = [];
    var sql = "SELECT * FROM homekippa.Like WHERE post_id = ? ";
    for (var i = 0; i < list.length; i++) {
      var t = await delay(list[i], sql, list[i].id);
      temp_list.push(t);
    }
    return temp_list;
  }

  //여기서 scope결정하는 것도 추가했으면 좋겠는데 어떻게 하지?
  //여기만 추가하면 될듯 scope = 0 : wholeScope / scope = 1 : followScope / scope = 2 : closedScope
  //만약 scope가 0 일 때는 tab F하고 L 둘 다 됨
  //만약 scope가 1 일 때는 tab F만 됨
  //만약 scope가 2 일 때는 tab F하고 L 둘 다 안된다.

  if (tab == "F") {
    var sqlPost =
      "SELECT A.* FROM homekippa.Post A LEFT JOIN homekippa.Followrelation B on A.group_id = B.to_id WHERE B.from_id = ? AND `scope` != 2 ORDER BY `date` DESC;";
  } else {
    var sqlPost =
      "SELECT * FROM homekippa.Post WHERE `area` = '" +
      area +
      "' AND `scope` =0 ORDER BY `date` DESC";
  }
  console.log(sqlPost);
  //Execute
  getPostData(sqlPost)
    .then(function (data) {
      return data;
    })
    .then(function (data) {
      postList = data;
      groupList = getGroupData(data);

      return groupList;
    })
    .then(function (data) {
      console.log(groupList);
      groupList = data;
      likeList = getLikeData(postList);
      return likeList;
    })
    .then(function (data) {
      likeList = data;
      console.log(data);

      resultCode = 200;
      message = "data get 성공";
      res.json({
        groupData: groupList,
        postData: postList,
        likeData: likeList,
        code: resultCode,
        message: message,
      });
    });
});

router.post("/setlike", (req, res) => {
  var postid = req.body.post_id;
  var userid = req.body.user_id;
  var isliked = req.body.isLiked;

  console.log("postid" + postid);
  console.log("isliked " + isliked);

  if (isliked) {
    var sqlLike =
      "INSERT INTO homekippa.Like (post_id, user_id) VALUES (?, ?);";
    var sqlPost =
      "UPDATE homekippa.Post SET like_num=like_num + 1  WHERE id = ?;";
  } else {
    var sqlLike =
      "DELETE FROM homekippa.Like WHERE post_id = ? AND user_id = ? ;";
    var sqlPost =
      "UPDATE homekippa.Post SET like_num =like_num - 1 where id= ?";
  }

  async function setLikeQuery() {
    db.query(sqlLike, [postid, userid], (err, result) => {
      if (err) {
        console.log(err);
        console.log(result);
      } else {
        resultCode = 200;
        message = "like SET 성공";
      }
    });

    db.query(sqlPost, postid, (err, result) => {
      if (err) {
        console.log(err);
        console.log(result);
      } else {
        resultCode = 200;
        message = "like SET 성공";
      }
    });
  }

  setLikeQuery().then(function () {
    res.json({
      code: resultCode,
      message: message,
    });
  });

  var resultCode = 404;
  var message = "에러 발생";
});

router.post(
  "/add/photo",
  multer({
    storage: storage,
  }).single("upload"),
  (req, res) => {
    var id = req.query.groupId;
    var resultCode = 404;
    var message = "에러 발생";
    var area = req.body.area;
    var group_id = req.body.groupId;
    var user_id = req.body.userId;
    var title = req.body.title;
    var content = req.body.content;
    var image = "./images/" + req.file.filename;
    var scope = req.body.scope;

    if(scope == "wholeScope"){
      scope = 0;
    }else if(scope == "followScope"){
      scope = 1;
    }else if(scope == "closedScope"){
      scope = 2;
    }

    console.log("ㄸ호잉또잉", req.body);
    async function insertData() {
      var sqlInsert =
        "INSERT INTO homekippa.Post (group_id, user_id, title, content, image, `date`, like_num, comment_num, scope, area) VALUES (?, ?, ?, ?, ?, ? ,? ,?, ?, ?);";
      db.query(
        sqlInsert,
        [group_id, user_id, title, content, image, new Date(), 0, 0, scope,area],
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            resultCode = 200;
            message = "게시글추가성공";
            addNewPost();
          }
        }
      );
    }
    insertData();
    function addNewPost() {
      res.json({
        code: resultCode,
        message: message,
      });
    }
  }
);

router.post("/add", (req, res) => {
  var id = req.query.groupId;
  var resultCode = 404;
  var message = "에러 발생";
  var area = req.body.area;
  var group_id = req.body.GroupId;
  var user_id = req.body.UserId;
  var title = req.body.title;
  var content = req.body.content;

  var scope = req.body.scope;



  if(scope == "wholeScope"){
    scope = 0;
  }else if(scope == "followScope"){
    scope = 1;
  }else if(scope == "closedScope"){
    scope = 2;
  }



  console.log("ㄸ호잉또잉", req.body);
  async function insertData() {
    var sqlInsert =
      "INSERT INTO homekippa.Post (group_id, user_id, title, content, `date`, like_num, comment_num, scope, area) VALUES (?, ?, ?, ?, ? ,? ,?, ?, ?);";
    db.query(
      sqlInsert,
      [group_id, user_id, title, content, new Date(), 0, 0, scope, area],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resultCode = 200;
          message = "게시글추가성공";
          addNewPost();
        }
      }
    );
  }
  insertData();
  function addNewPost() {
    res.json({
      code: resultCode,
      message: message,
    });
  }
});


router.put("/delete", (req, res) => {
  var post_id = req.query.postId;
 console.log("내일내일", post_id);
  async function deleteData() {
    var sqlDelete =
      "DELETE from homekippa.Post where id = "+post_id;
    db.query(
      sqlDelete,
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          resultCode = 200;
          message = "게시글삭제성공";
          deletePost();
        }
      }
    );
  }
  deleteData();
  function deletePost() {
    res.json({
      code: resultCode,
      message: message,
    });
  }
});

module.exports = router;
