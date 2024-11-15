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
exports.initializeGun = initializeGun;
exports.setupCleanup = setupCleanup;
const gun_1 = __importDefault(require("gun"));
const const_1 = require("../utils/const");
const hotel_services_1 = require("./hotel-services");
const CLEANUP_INTERVAL = process.env.CLEANUP_INTERVAL || 24 * 60 * 60 * 1000;
function initializeGun(listener) {
    const gun = (0, gun_1.default)({
        web: listener,
        file: "data.json",
        localStorage: true,
    });
    console.log("GunDB initialized");
    // Event Listeners
    gun.on("put", (msg) => __awaiter(this, void 0, void 0, function* () { return handlePutEvent(msg); }));
    gun.on("hi", handlePeerConnect);
    gun.on("bye", () => console.log("Peer disconnected"));
    return gun;
}
function handlePutEvent(msg) {
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
}
function handlePeerConnect(peer) {
    const APP_DOMAIN = process.env.APP_DOMAIN;
    if (peer.wire.headers.origin !== APP_DOMAIN) {
        console.warn("Unauthorized peer:", peer.wire.headers.origin);
        peer.wire.terminate();
    }
    else {
        console.log("Authorized peer connected:", peer.wire.headers.origin);
    }
}
function setupCleanup(gun) {
    const cleanupOutdatedData = () => {
        const expiryDate = Date.now() - Number(CLEANUP_INTERVAL);
        console.log("Running cleanup:", new Date().toISOString());
        gun
            .get(const_1.DB_NAME)
            .map()
            .once((data, recordKey) => {
            if ((data === null || data === void 0 ? void 0 : data.last_updated) && data.last_updated < expiryDate) {
                console.log(`Removing outdated record: ${recordKey}`);
                gun.get(const_1.DB_NAME).get(recordKey).put(null);
            }
        });
    };
    cleanupOutdatedData();
    setInterval(cleanupOutdatedData, Number(CLEANUP_INTERVAL));
}
