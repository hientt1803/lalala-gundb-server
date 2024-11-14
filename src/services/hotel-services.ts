import Hotel from "../entities/hotel-model";
import { generateCurrentTimeStamp } from "../utils/date-time";

export const addNewRecordToHotel = async (searchKey: string, data: string) => {
  try {
    const hotel = new Hotel({
      searchKey: searchKey,
      data: data,
      createdAt: generateCurrentTimeStamp(),
      updatedAt: generateCurrentTimeStamp(),
    });

    await hotel.save();

    console.log("saved new record to mongoDB");
  } catch (error) {
    console.log(error);
  }
};
