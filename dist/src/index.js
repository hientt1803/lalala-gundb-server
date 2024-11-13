"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const Gun = require("gun");
const express_rate_limit_1 = require("express-rate-limit");
const cors_2 = require("./cors");
// require("gun-mongo");
// require("gun-mongo-key");
require("dotenv").config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
// middleware & config
app.set("view engine", "ejs");
// helmet for cors
app.use((0, helmet_1.default)({}));
// limit request
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
});
app.use(limiter);
// cors config
app.use((0, cors_1.default)(cors_2.corsOptions));
app.use(Gun.serve);
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static("public"));
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
gun.on("put", function (msg) {
    console.log("Data being saved:", msg);
});
gun.on("hi", (peer) => {
    console.log("Peer connected:", peer);
});
gun.on("bye", (peer) => {
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
app.get("/", function (request, response) {
    response.status(200).json("SERVER IS RUNNING NOW");
});
