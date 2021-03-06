const express = require("express");

const AWS = require("aws-sdk");

var axios = require("axios");
var cheerio = require("cheerio");

const mysql = require("mysql");
const dbconfig = require("./config/database.js");
const db = mysql.createConnection(dbconfig);

const PORT = (process.env.PORT = 3000);
const bodyParser = require("body-parser");

const app = express();
const userRouter = require("./routes/user");
const groupRouter = require("./routes/group");
const petRouter = require("./routes/pet");
const postRouter = require("./routes/post");
const commentRouter = require("./routes/comment");
const followRouter = require("./routes/follow");
const weatherRouter = require("./routes/weather");

//const firebaseRouter = require("./routes/firebase");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/user", userRouter);
app.use("/group", groupRouter);
app.use("/pet", petRouter);
app.use("/post", postRouter);
app.use("/comment", commentRouter);
app.use("/follow", followRouter);
app.use("/weather", weatherRouter);
//app.use("/firebase", firebaseRouter);

function handleDisconnect() {
  db.connect(function (err) {
    if (err) {
      console.log("error when connecting to db:", err);
      setTimeout(handleDisconnect, 2000);
    }
  });

  db.on("error", function (err) {
    console.log("db error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      return handleDisconnect();
    } else {
      throw err;
    }
  });
}

// router.post("/reports/add", (req, res) => {
//   var group_id = req.body.GroupId;
//   var pet_id = req.body.PetId;
//   var title = req.body.dailyWorkName;

//   var alarm = req.body.dailyWorkAlarm;
//   var desc = req.body.dailyWorkDesc;
//   var time = req.body.dailyWorkTime;
//   var resultCode = 404;
//   var message = "에러 발생";

//   async function insertData() {
//     var sqlInsert =
//       "INSERT INTO homekippa.Report (group_id, pet_id, title, alarm, `desc`, `time`) VALUES (?, ?, ?, ?, ?, ?);";
//     db.query(
//       sqlInsert,
//       [group_id, pet_id, title, alarm, desc, time],
//       (err, result) => {
//         if (err) {
//           console.log(err);
//         } else {
//           resultCode = 200;
//           message = "그룹추가성공";
//           addNewReport();
//         }
//       }
//     );
//   }
//   insertData();
//   function addNewReport() {
//     res.json({
//       code: resultCode,
//       message: message,
//     });
//   }
// });
// 일단 주석
// handleDisconnect();

app.listen(PORT, () => {
  console.log("Server is running at:", PORT);
});
