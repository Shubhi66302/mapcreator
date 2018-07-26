// utils/import/elevator-json.js
/// import elevator.json file into db
// import mongoose from "mongoose";
// var connection = mongoose.connect(process.env.MONGODB_URI);
//
// // use js promise
// mongoose.Promise = global.Promise;
import Elevator from "server/src/models/elevator";

export default async (elevatorsJson, mapId) => {
  var dedupedElevatorsJson = elevatorsJson.map(
    ({
      entry_barcodes,
      coordinate_list,
      reinit_barcodes,
      exit_barcodes,
      ...rest
    }) => ({
      ...rest,
      entry_barcodes: _.uniqBy(entry_barcodes, "barcode"),
      coordinate_list: _.uniqBy(coordinate_list, JSON.stringify),
      reinit_barcodes: _.uniqBy(reinit_barcodes, "floor_id"),
      exit_barcodes: _.uniqBy(exit_barcodes, "barcode")
    })
  );
  // I don't do shit
  return [1, 2];
};
