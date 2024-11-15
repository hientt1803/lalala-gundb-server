import bodyParser from "body-parser";
import cors from "cors";
import express, { Response } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";
import { corsOptions } from "./securities/cors";
import { addNewRecordToHotel } from "./services/hotel-services";

const Gun = require("gun");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;
const APP_DOMAIN =
  process.env.NODE_ENV === "production"
    ? process.env.APP_DOMAIN
    : process.env.LOCAL_DOMAIN;

// middleware & config
app.set("view engine", "ejs");

// helmet for cors
app.use(
  helmet({
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
  })
);

// limit request
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below. more options here
});

app.use(limiter);

// cors config
app.use(cors(corsOptions));

app.use(Gun.serve);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect MongoDB
mongoose
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

    gun.on("put", async function (msg: any) {
      try {
        const searchKey: string = msg.put["#"];

        if (!searchKey || !searchKey.startsWith("lalalaDatabase/")) {
          return;
        }

        const data = msg.put[":"];

        if (typeof data !== "string") {
          return;
        }

        const parsedData = JSON.parse(data);

        if (
          !parsedData ||
          !parsedData.hotels ||
          !Array.isArray(parsedData.hotels)
        ) {
          return;
        }

        // Process only valid data
        // console.log(searchKey.split("/")[1]);
        // console.log(parsedData);

        await addNewRecordToHotel(
          searchKey.split("/")[1],
          JSON.stringify(parsedData)
        );
      } catch (error) {
        // Just ignore errors silently or log if needed
        // console.error("Error processing put message:", error);
      }
    });

    gun.on("hi", (peer: any) => {
      if (peer.wire.headers.origin !== APP_DOMAIN) {
        console.log(
          "Unauthorized peer attempted to connect:",
          peer.wire.headers.origin
        );

        peer.wire.terminate();
      } else {
        console.log("Peer connected:", peer.wire.headers.origin);
      }
    });

    gun.on("bye", (peer: any) => {
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
app.get("/", function (response: Response) {
  response.status(200).json("SERVER IS RUNNING NOW");
});
