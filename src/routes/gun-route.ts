// import express, { Request, Response } from "express";
// // import { loadGunData, syncDataToGunDB } from "../services/gun-service";
// import { IHotelSearchRegionResult } from "../types/gun-hotel-types";
// import pako from "pako";

// export default function createGunRouter(gun: any) {
//   const gunRouter = express.Router();

//   gunRouter.get("/:searchKey", async (req: Request, res: Response) => {
//     const { searchKey } = req.params;

//     console.log("GET DATA SEARCH KEY, ", searchKey);

//     try {
//       const data = await loadGunData(searchKey, gun);
//       if (data) {
//         res.status(200).json({
//           mes: "Data found",
//           data: data,
//         });
//       } else {
//         res.status(404).json({
//           msg: "Data not found",
//           data: null,
//         });
//       }
//     } catch (error) {
//       console.error("Error retrieving data from GunDB:", error);
//       res.status(500).json({
//         msg: "Error retrieving data from GunDB: " + error,
//         data: null,
//       });
//     }
//   });

//   gunRouter.post("/sync", async (req: Request, res: Response): Promise<any> => {
//     const { searchKey, data } = req.body;

//     if (!searchKey || !data) {
//       return res.status(400).json({ msg: "searchKey and data are required" });
//     }

//     try {
//       // Decode Base64 to Uint8Array
//       const binaryData = Buffer.from(data, "base64");
//       // Decompress
//       const decompressedData = pako.inflate(binaryData, { to: "string" });
//       const parsedData = JSON.parse(decompressedData);

//       await syncDataToGunDB(
//         searchKey,
//         parsedData as IHotelSearchRegionResult,
//         gun
//       );
//       res.status(200).json({ msg: "Data successfully synced to GunDB" });
//     } catch (error) {
//       console.error("Error syncing data to GunDB:", error);
//       res.status(500).json({ msg: "Failed to sync data to GunDB" });
//     }
//   });

//   return gunRouter;
// }
