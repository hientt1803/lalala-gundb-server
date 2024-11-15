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
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_2 = require("./securities/cors");
const helmet_2 = require("./securities/helmet");
const gun_service_1 = require("./services/gun-service");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
const MONGODB_URL = process.env.MONGODB_URL;
const APP_DOMAIN = process.env.NODE_ENV === "production"
    ? process.env.APP_DOMAIN
    : process.env.LOCAL_DOMAIN;
// Middlewares
app.use((0, helmet_1.default)((0, helmet_2.helmetOptions)(APP_DOMAIN)));
app.use((0, express_rate_limit_1.default)(helmet_2.limiterOptions));
app.use((0, cors_1.default)(cors_2.corsOptions));
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static("public"));
// MongoDB Connection
function connectToMongo() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(MONGODB_URL);
            console.log("Connected to MongoDB");
        }
        catch (error) {
            console.error("Error connecting to MongoDB:", error);
            process.exit(1);
        }
    });
}
// Start Server
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        yield connectToMongo();
        const listener = app.listen(PORT, () => {
            console.log(`App listening on port ${PORT}`);
        });
        const gun = (0, gun_service_1.initializeGun)(listener);
        (0, gun_service_1.setupCleanup)(gun);
        process.on("unhandledRejection", (reason, promise) => {
            console.error("Unhandled Rejection:", reason);
        });
    });
}
// Root route
app.get("/", (_, res) => {
    res.status(200).json("SERVER IS RUNNING NOW");
});
startServer();
