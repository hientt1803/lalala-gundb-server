"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCurrentTimeStamp = void 0;
const generateCurrentTimeStamp = () => {
    const timestamp = Date.now();
    const last_updated = timestamp;
    return last_updated;
};
exports.generateCurrentTimeStamp = generateCurrentTimeStamp;
