// // gun-mongo-adapter.ts
// import mongoose from "mongoose";
// import { ObjectId } from "mongoose";
// import { Condition } from "mongoose";
// class GunMongoAdapter {
//   private collection: string;
//   private cache: Map<string, any>;
//   private writeQueue: Array<any>;
//   constructor(collection = "gun_data") {
//     this.collection = collection;
//     this.cache = new Map();
//     this.writeQueue = [];
//     this.initWriteQueue();
//   }
//   private initWriteQueue() {
//     setInterval(() => this.processBatchWrites(), 1000);
//   }
//   private async processBatchWrites() {
//     if (this.writeQueue.length === 0) return;
//     const batch = this.writeQueue.splice(0);
//     const operations = batch.map(({ key, data }) => ({
//       updateOne: {
//         filter: { _id: key },
//         update: { $set: { data } },
//         upsert: true,
//       },
//     }));
//     try {
//       await mongoose.connection
//         .collection(this.collection)
//         .bulkWrite(operations);
//     } catch (err) {
//       console.error("Batch write error:", err);
//       this.writeQueue.unshift(...batch);
//     }
//   }
//   put(key: string, data: any, callback?: Function) {
//     try {
//       // Ensure data has Gun's metadata structure
//       if (!data._) {
//         data._ = {
//           "#": key,
//           ">": {},
//         };
//       }
//       this.cache.set(key, data);
//       this.writeQueue.push({ key, data });
//       callback && callback(null);
//     } catch (err) {
//       callback && callback(err);
//     }
//   }
//   get(key: string, callback: Function) {
//     try {
//       if (this.cache.has(key)) {
//         return callback(null, this.cache.get(key));
//       }
//       mongoose.connection
//         .collection(this.collection)
//         .findOne({ _id: key as Condition<ObjectId> })
//         .then((doc) => {
//           if (doc) {
//             this.cache.set(key, doc.data);
//             callback(null, doc.data);
//           } else {
//             callback(null, null);
//           }
//         })
//         .catch((err) => callback(err));
//     } catch (err) {
//       callback(err);
//     }
//   }
// }
// // Create flint adapter wrapper
// const createFlintAdapter = (collection: string) => {
//   const mongoAdapter = new GunMongoAdapter(collection);
//   return {
//     opt: () => {},
//     get: (key: string, cb: Function) => mongoAdapter.get(key, cb),
//     put: (key: string, data: any, cb: Function) => mongoAdapter.put(key, cb),
//     list: (_: any, cb: Function) => cb(null, []),
//   };
// };
// module.exports = createFlintAdapter;
