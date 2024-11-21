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

export const findHotelBySearchKey = async (
  searchKey: string
): Promise<boolean> => {
  try {
    const exists = await Hotel.findOne({ searchKey });
    return !!exists;
  } catch (error) {
    console.error("Error finding hotel by searchKey:", error);
    return false;
  }
};

export const findAllHotel = async (): Promise<boolean> => {
  try {
    const hotels = await Hotel.find();
    console.log(hotels);
  } catch (error) {
    console.error("Error finding hotel by searchKey:", error);
    return false;
  }
};
