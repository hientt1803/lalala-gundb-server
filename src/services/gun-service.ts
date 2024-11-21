import Gun from "gun";
import { DB_NAME } from "../utils/const";
import { addNewRecordToHotel, findHotelBySearchKey } from "./hotel-services";

const CLEANUP_INTERVAL = process.env.CLEANUP_INTERVAL || 24 * 60 * 60 * 1000;

export function initializeGun(listener: any) {
  const gun = Gun({
    web: listener,
    file: "data.json",
    localStorage: true,
  });

  console.log("GunDB initialized");

  // Event Listeners
  gun.on("put", async (msg: any) => handlePutEvent(msg));
  gun.on("hi", handlePeerConnect);
  gun.on("bye", () => console.log("Peer disconnected"));

  return gun;
}

async function handlePutEvent(msg: any) {
  try {
    const searchKey: string = msg.put["#"];

    if (!searchKey || !searchKey.startsWith("lalalaDatabase/")) {
      return;
    }

    const data = msg.put[":"];

    if (typeof data !== "string") {
      return;
    }

    const parsedData = JSON.parse(data);

    if (
      !parsedData ||
      !parsedData.hotels ||
      !Array.isArray(parsedData.hotels)
    ) {
      return;
    }

    // Process only valid data
    // console.log(searchKey.split("/")[1]);
    // console.log(parsedData);

    const recordExists = checkRecordExists(searchKey);

    if (!recordExists) {
      await addNewRecordToHotel(
        searchKey.split("/")[1],
        JSON.stringify(parsedData)
      );
    } else {
      console.log("Record already exists, skipping insertion for:", searchKey);
    }
  } catch (error) {
    // console.error("Error processing put message:", error);
  }
}

async function checkRecordExists(recordId: string): Promise<boolean> {
  return findHotelBySearchKey(recordId);
}

function handlePeerConnect(peer: any) {
  const APP_DOMAIN =
    process.env.NODE_ENV === "production"
      ? process.env.APP_DOMAIN
      : process.env.LOCAL_DOMAIN;

  if (peer.wire.headers.origin !== APP_DOMAIN) {
    console.warn("Unauthorized peer:", peer.wire.headers.origin);
    peer.wire.terminate();
  } else {
    console.log("Authorized peer connected:", peer.wire.headers.origin);
  }
}

export function setupCleanup(gun: any) {
  const cleanupOutdatedData = () => {
    const expiryDate = Date.now() - Number(CLEANUP_INTERVAL);
    console.log("Running cleanup:", new Date().toISOString());

    gun
      .get(DB_NAME)
      .map()
      .once((data: any, recordKey: string) => {
        if (data?.last_updated && data.last_updated < expiryDate) {
          console.log(`Removing outdated record: ${recordKey}`);
          gun.get(DB_NAME).get(recordKey).put(null);
        }
      });
  };

  cleanupOutdatedData();
  setInterval(cleanupOutdatedData, Number(CLEANUP_INTERVAL));
}

// /**
//  * The function `getAllGunData` retrieves all data from a database named `DB_NAME` using the `gun`
//  * library in TypeScript.
//  */
// export const getAllGunData = (gun: any) => {
//   gun
//     .get(DB_NAME)
//     .map()
//     .once((data: any) => console.log(data));
// };

// /**
//  * The function fetches gun data based on a search key and returns it along with metadata or null if no
//  * data is found.
//  * @param {string} searchKey - The `searchKey` parameter in the `fetchGunData` function is a string
//  * that is used to search for data in the GunDB database. It is passed to the GunDB database to
//  * retrieve the corresponding data associated with that key.
//  * @returns The `fetchGunData` function is returning a Promise that resolves to an array of objects
//  * with the following structure:
//  */
// export async function fetchGunData(
//   searchKey: string,
//   gun: any
// ): Promise<
//   | {
//       data: IHotelSearchRegionResult;
//       last_updated: number;
//       searchKey: string;
//     }[]
//   | null
// > {
//   return new Promise((resolve) => {
//     const gunData: {
//       data: IHotelSearchRegionResult;
//       last_updated: number;
//       searchKey: string;
//     }[] = [];

//     gun
//       .get(DB_NAME)
//       .get(searchKey)
//       .once((data: { data: string; last_updated: any }, key: any) => {
//         if (data) {
//           if (data?.data !== undefined) {
//             const deserializedGunData = deserializeFromStringToJson(data?.data);
//             gunData.push({
//               searchKey: key,
//               data: deserializedGunData,
//               last_updated: data.last_updated,
//             });
//             resolve(gunData);
//           } else {
//             return resolve(null);
//           }
//         } else {
//           // console.log("No data found in GunDB");
//           resolve(null);
//         }
//       });
//   });
// }

// /**
//  * The function `loadGunData` asynchronously fetches gun data based on a search key and returns the
//  * first result or null if no data is found.
//  * @param {string} searchKey - The `searchKey` parameter in the `loadGunData` function is a string that
//  * represents the key used to search for gun data in the GunDB database. This key is passed to the
//  * `fetchGunData` function to retrieve the relevant data.
//  * @returns The `loadGunData` function returns either the first element of the `gunData` array if it
//  * exists, or `null` if `gunData` is falsy. If an error occurs during the data loading process, the
//  * function also returns `null`.
//  */
// export async function loadGunData(searchKey: string, gun: any) {
//   try {
//     const gunData = await fetchGunData(searchKey, gun);
//     console.log("Loaded data from GunDB:", gunData);
//     if (gunData) {
//       return gunData[0];
//     } else {
//       // console.warn("No data found in GunDB for this search key.");
//       return null;
//     }
//   } catch (error) {
//     // console.error("Error loading data from GunDB:", error);
//     return null;
//   }
// }

// /**
//  * The function `syncDataToGunDB` asynchronously syncs data to a GunDB database using a search key and
//  * hotel search region result.
//  * @param {string} searchKey - The `searchKey` parameter is a string that represents the key used to
//  * identify the data being synced to GunDB. It is used to store and retrieve the data associated with
//  * this key in the GunDB database.
//  * @param {IHotelSearchRegionResult} data - The `data` parameter in the `syncDataToGunDB` function is
//  * of type `IHotelSearchRegionResult`. This parameter represents the data that you want to synchronize
//  * to the GunDB database. It should contain information related to a hotel search region result.
//  * @returns The `syncDataToGunDB` function is returning a `Promise<void>`.
//  */
// export async function syncDataToGunDB(
//   searchKey: string,
//   data: IHotelSearchRegionResult,
//   gun: any
// ): Promise<void> {
//   const timestamp = generateCurrentTimeStamp();

//   const gunData: {
//     data: string;
//     last_updated: number;
//     searchKey: string;
//   } = {
//     data: serializeFromJsonToString(data),
//     last_updated: timestamp,
//     searchKey: searchKey,
//   };

//   gun
//     .get(DB_NAME)
//     .get(searchKey)
//     .put(gunData, (ack: any) => {
//       if (ack.err) {
//         // console.error("Failed to sync data to GunDB:", ack.err);
//         // reject(new Error("Failed to sync data to GunDB"));
//       } else {
//         // console.log("Sync data to gunDB completed");
//         // resolve();
//       }
//     });
// }
