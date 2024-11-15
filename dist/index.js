"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = require("express-rate-limit");
const helmet_1 = __importDefault(require("helmet"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_2 = require("./securities/cors");
const hotel_services_1 = require("./services/hotel-services");
const Gun = require("gun");
require("dotenv").config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
const APP_DOMAIN = process.env.NODE_ENV === "production"
    ? process.env.APP_DOMAIN
    : process.env.LOCAL_DOMAIN;
// middleware & config
app.set("view engine", "ejs");
// helmet for cors
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'", APP_DOMAIN],
            scriptSrc: ["'self'", APP_DOMAIN],
        },
    },
    referrerPolicy: {
        policy: "no-referrer",
    },
    // disable DNS Prefetching
    xDnsPrefetchControl: {
        allow: false,
    },
    // prevent mime types sniffing
    noSniff: false,
}));
// limit request
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 200, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below. more options here
});
app.use(limiter);
// cors config
app.use((0, cors_1.default)(cors_2.corsOptions));
app.use(Gun.serve);
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static("public"));
// Connect MongoDB
mongoose_1.default
    .connect(process.env.MONGODB_URL)
    .then(() => {
    console.log("Connected to MongoDB");
    const listener = app.listen(PORT, function () {
        console.log("Your app is listening on port " + PORT);
        console.log("CORS allowed: ", APP_DOMAIN);
    });
    const gunconfig = {
        web: listener,
        file: "data.json",
    };
    // init gun
    const gun = Gun(gunconfig);
    console.log("init gun");
    // GUN event listeners
    gun.on("out", { get: { "#": { "*": "" } } });
    gun.on("put", function (msg) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const searchKey = msg.put["#"];
                if (!searchKey || !searchKey.startsWith("lalalaDatabase/")) {
                    return;
                }
                const data = msg.put[":"];
                if (typeof data !== "string") {
                    return;
                }
                const parsedData = JSON.parse(data);
                if (!parsedData ||
                    !parsedData.hotels ||
                    !Array.isArray(parsedData.hotels)) {
                    return;
                }
                // Process only valid data
                // console.log(searchKey.split("/")[1]);
                // console.log(parsedData);
                yield (0, hotel_services_1.addNewRecordToHotel)(searchKey.split("/")[1], JSON.stringify(parsedData));
            }
            catch (error) {
                // Just ignore errors silently or log if needed
                // console.error("Error processing put message:", error);
            }
        });
    });
    gun.on("hi", (peer) => {
        if (peer.wire.headers.origin !== APP_DOMAIN) {
            console.log("Unauthorized peer attempted to connect:", peer.wire.headers.origin);
            peer.wire.terminate();
        }
        else {
            console.log("Peer connected:", peer.wire.headers.origin);
        }
    });
    gun.on("bye", (peer) => {
        console.log("Peer disconnected");
    });
})
    .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
});
// Error handling
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
// Root route
app.get("/", function (response) {
    response.status(200).json("SERVER IS RUNNING NOW");
});
