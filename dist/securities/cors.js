"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
const whitelist = [process.env.APP_DOMAIN, process.env.LOCAL_DOMAIN];
exports.corsOptions = {
    origin: function (origin, callback) {
        console.log("Request origin:", origin);
        if (whitelist.indexOf(origin || process.env.LOCAL_DOMAIN) !== -1) {
            callback(null, true);
        }
        else {
            console.log("Blocked by CORS:", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
};