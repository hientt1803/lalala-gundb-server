"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.limiterOptions = exports.helmetOptions = void 0;
const helmetOptions = (appDomain) => ({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'", appDomain],
            scriptSrc: ["'self'", appDomain],
        },
    },
    referrerPolicy: { policy: "no-referrer" },
    xDnsPrefetchControl: { allow: false },
    noSniff: false,
});
exports.helmetOptions = helmetOptions;
exports.limiterOptions = {
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
};
