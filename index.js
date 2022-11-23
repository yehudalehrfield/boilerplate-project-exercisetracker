const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require("body-parser");
require('dotenv').config()

// basic configuration
app.use(cors())

// allow for parsing body in POST requests
app.use(bodyParser.urlencoded({extended:false}));

// connect to mongoose
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.static('public'))

// DO I NEED TO ALSO DEFINE THE FIELDS FOR THE OBJECTS IN THE LOG ARRAY?
const exerciseLogSchema = new mongoose.Schema({
  username: {type: String, required: true},
  count: {type: Number, default: 0},
  log: []
})

const eLog = mongoose.model('eLog',exerciseLogSchema);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// post new user, return new or existing user
app.post('/api/users', async (req, res) => {
  let newUser = req.body.username;
  // check if username exists already
  let existingUser = await eLog.findOne({username: newUser});
  if (existingUser) console.log(`User ${newUser} already exists with id: ${existingUser.id}.`)
  else{
    await eLog.create({
      username:newUser
    })
    console.log(`New user created with username ${newUser}.`)
  }
  eLog.findOne({username:newUser}, 'username _id', (err,userData) => {
    res.json({
      username: userData.username,
      _id: userData._id
    });
  });
  // // using await
  // let userInfo = eLog.findOne({username: newUser}, 'username _id');
  // res.json(userInfo);
});

// get all users
app.get('/api/users', (req, res) => {
  eLog.find({}, 'username _id', (err, users) => {
    if (err) console.log(err)
    res.send(users);
  });
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
