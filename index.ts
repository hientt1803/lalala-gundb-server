import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";

const Gun = require("gun");
import { rateLimit } from "express-rate-limit";
import { corsOptions } from "./cors";

// require("gun-mongo");
// require("gun-mongo-key");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

// middleware & config
app.set("view engine", "ejs");

// helmet for cors
app.use(helmet({}));

// limit request
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
});

app.use(limiter);

// cors config
app.use(cors(corsOptions));

app.use(Gun.serve);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// init server
const listener = app.listen(PORT, function () {
  console.log("Your app is listening on port " + PORT);
});

const gunconfig = {
  web: listener,
  file: "data.json",
  radisk: true,
};

// init gun
const gun = Gun(gunconfig);
console.log("init gun");

// event listeners
gun.on("out", { get: { "#": { "*": "" } } });

gun.on("put", function (msg: any) {
  console.log("Data being saved:", msg);
});

gun.on("hi", (peer: any) => {
  console.log("Peer connected:", peer);
});

gun.on("bye", (peer: any) => {
  console.log("Peer disconnected:", peer);
});

// connect to mongoo and gun
// mongoose
//   .connect(MONGODB_URL!)
//   .then(() => {
//     console.log("MongoDB connected successfully!");
// Debug và verify storage route
// app.get("/test-storage", async (req: any, res: any) => {
//   const testKey = "test-" + Date.now();
//   const testData = { hello: "world" };

//   gun.get(testKey).put(testData);

//   setTimeout(async () => {
//     const hotel = new Hotel({
//       id: testKey,
//       searchKey: "Awesome Post!",
//       data: "awesome-post",
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });

//     await hotel.save();

//     const searchedData = await Hotel.findById(hotel.id).exec();
//     // const mongoData = await mongoose.connection
//     //   .collection("lalala")
//     //   .findOne({ key: testKey });

//     console.log(hotel);
//     console.log(searchedData);

//     res.json({
//       gunData: await new Promise((resolve) => {
//         gun.get(testKey).once((data: unknown) => resolve(data));
//       }),
//       hotel,
//     });
//   }, 1000);
// });

// // Health check endpoint
// app.get("/health", (req: any, res: any) => {
//   const health = {
//     uptime: process.uptime(),
//     message: "OK",
//     timestamp: Date.now(),
//     // connections: gun._.opt.peers.length,
//     connectDatabase: gun,
//   };
//   res.status(200).send(health);
// });
// })
// .catch((error: any) => {
//   console.error("MongoDB connection error:", error);
//   process.exit(1);
// });

// MongoDB event listeners
// mongoose.connection.on("error", (err: any) => {
//   console.error("MongoDB error:", err);
// });

// mongoose.connection.on("disconnected", () => {
//   console.log("MongoDB disconnected");
// });

// mongoose.connection.on("connected", () => {
//   console.log("MongoDB connected");
// });

// Error handling
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Root route
app.get("/", function (request: any, response: any) {
  response.status(200).json("SERVER IS RUNNING NOW");
});
