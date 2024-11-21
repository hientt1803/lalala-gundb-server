import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Response } from "express";
import rateLimit from "express-rate-limit";
import helmet, { HelmetOptions } from "helmet";
import mongoose from "mongoose";
// import createGunRouter from "./routes/gun-route";
import { corsOptions } from "./securities/cors";
import { helmetOptions, limiterOptions } from "./securities/helmet";
import { initializeGun, setupCleanup } from "./services/gun-service";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const MONGODB_URL = process.env.MONGODB_URL as string;
const APP_DOMAIN =
  process.env.NODE_ENV === "production"
    ? process.env.APP_DOMAIN
    : process.env.LOCAL_DOMAIN;

// Middlewares
app.use(helmet(helmetOptions(APP_DOMAIN) as HelmetOptions));
app.use(rateLimit(limiterOptions));
app.use(cors(corsOptions));
app.use(express.static("public"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// MongoDB Connection
async function connectToMongo() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

// Start Server
async function startServer() {
  await connectToMongo();

  const listener = app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log("Allow host connection: ", APP_DOMAIN);
  });

  const gun = initializeGun(listener);
  setupCleanup(gun);

  // app.use("/api/gun", cors(corsOptions), createGunRouter(gun));

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
  });
}

// Root route
app.get("/", (_, res: Response) => {
  res.status(200).json("SERVER IS RUNNING NOW");
});

startServer();
