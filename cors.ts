import { CorsOptions } from "cors";

const whitelist = [process.env.APP_DOMAIN, "http://localhost:3000"];

export const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin || "http://localhost:3000") !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};