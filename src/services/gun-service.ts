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
