const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

// basic configuration
app.use(cors());

// allow for parsing body in POST requests
app.use(bodyParser.urlencoded({ extended: false }));

// connect to mongoose
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.static("public"));

// DO I NEED TO ALSO DEFINE THE FIELDS FOR THE OBJECTS IN THE LOG ARRAY?
const exerciseLogSchema = new mongoose.Schema({
  username: { type: String, required: true },
  count: { type: Number, default: 0 },
  log: [],
});

const eLog = mongoose.model("eLog", exerciseLogSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// post new user, return new or existing user
app.post("/api/users", async (req, res) => {
  let newUser = req.body.username;
  // check if username exists already
  let existingUser = await eLog.findOne({ username: newUser });
  if (existingUser)
    console.log(`User ${newUser} already exists with id: ${existingUser.id}.`);
  else {
    await eLog.create({
      username: newUser,
    });
    console.log(`New user created with username ${newUser}.`);
  }
  eLog.findOne({ username: newUser }, "username _id", (err, userData) => {
    res.json({
      username: userData.username,
      _id: userData._id,
    });
  });
  // // using await
  // let userInfo = eLog.findOne({username: newUser}, 'username _id');
  // res.json(userInfo);
});

// get all users
app.get("/api/users", (req, res) => {
  eLog.find({}, "username _id", (err, users) => {
    if (err) console.log(err);
    res.send(users);
  });
});

// post new exercise
app.post("/api/users/:_id/exercises", async (req, res) => {
  // let userInfo = await eLog.findOne({ _id: req.params.id });
  let userInfo = await eLog.findById(req.params._id); // need .exec()?
  console.log(req.body);
  console.log(req.params);
  console.log(userInfo);
  
  userInfo.count += 1;
  userInfo.log.push({
    description: req.body.description,
    duration: req.body.duration,
    // does the req.body.date need to be parsed to follow the same format as toDateString() does? 
    date: req.body.date ? req.body.date : new Date().toDateString(),
  });

  await userInfo.save();

  res.json({
    username: userInfo.username,
    description: userInfo.log[userInfo.count-1].description, // can also use req.body
    duration: userInfo.log[userInfo.count-1].duration, // can also use req.body
    data: userInfo.log[userInfo.count-1].date, // can also use req.body
    _id: userInfo._id
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
