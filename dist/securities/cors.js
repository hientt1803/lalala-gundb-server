"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
const whitelist = [process.env.APP_DOMAIN, "http://localhost:3000"];
exports.corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin || "http://localhost:3000") !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
};
