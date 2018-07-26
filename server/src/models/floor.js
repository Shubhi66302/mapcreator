// models/floor.js
// represents floor map. will store all the jsons for the floor ?
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var schema = mongoose.Schema({
  // back ref to map id
  _map: { type: Number, ref: "Map" },
  // local floor_id, specific to its map
  floor_id: Number
  // NOTE: don't store barcode refs since map can be very large? (eg. 1M barcodes)
  // instead store floor refs in barcode collection
  // barcodes: [{ type: Number, ref: "Barcode" }],
});

// define compound index to ensure (_map, floor_id) is unique
schema.index({ _map: 1, floor_id: 1 }, { unique: true });
module.exports = mongoose.model("Floor", schema);
