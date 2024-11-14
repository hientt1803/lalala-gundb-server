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
exports.addNewRecordToHotel = void 0;
const hotel_model_1 = __importDefault(require("../entities/hotel-model"));
const date_time_1 = require("../utils/date-time");
const addNewRecordToHotel = (searchKey, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotel = new hotel_model_1.default({
            searchKey: searchKey,
            data: data,
            createdAt: (0, date_time_1.generateCurrentTimeStamp)(),
            updatedAt: (0, date_time_1.generateCurrentTimeStamp)(),
        });
        yield hotel.save();
        console.log("saved new record to mongoDB");
    }
    catch (error) {
        console.log(error);
    }
});
exports.addNewRecordToHotel = addNewRecordToHotel;
