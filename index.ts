// gun-server.js
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const GunDB = require("gun");
const helmet = require("helmet");
// import nocache from "nocache";
const cors = require("cors");

require("dotenv").config();
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

app.use(helmet({ contentSecurityPolicy: false }));
//app.use(nocache());

const corsOptions = {
  //origin: "https://chrome-probable-orchestra.glitch.me",
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders:
    "Access-Control-Allow-Headers,Access-Control-Allow-Origin,Access-Control-Request-Method,Access-Control-Request-Headers,Origin,Cache-Control,Content-Type,X-Token,X-Refresh-Token",
  credentials: false,
  preflightContinue: true,
  optionsSuccessStatus: 204,
};

//app.use(cors());
app.use(cors(corsOptions));

app.use(function (req, res, next) {
  //deal with img-src access and other for dev builds.
  //res.header("Access-Control-Allow-Origin", "*");
  //res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
  //res.setHeader(
  //'Content-Security-Policy',
  //"default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'"
  //);
  //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  //res.header("Access-Control-Allow-Origin", "*");
  //res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH");
  //res.header("Access-Control-Allow-Headers", "Accept, Content-Type, Authorization, X-Requested-With");
  next();
});

app.use(GunDB.serve);
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/", function (request, response) {
  response.render("index"); //view/index
});

const listener = app.listen(PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
  //http://localhost:3000/
  //console.log(listener.address());
});

const gunconfig = {
  web: listener, // server express
  file: "data.json", // to store data in server
  radisk: true,
  localStorage: false,
};

const gun = GunDB(gunconfig);

gun.on("hi", (peer) => {
  console.log("Peer connected:", peer);
});

gun.on("bye", (peer) => {
  console.log("Peer disconnected:", peer);
});

gun.on("put", function (msg) {
  console.log("Data being saved:", msg);
});

gun.on("get", function (msg) {
  console.log("Data being requested:", msg);
});
