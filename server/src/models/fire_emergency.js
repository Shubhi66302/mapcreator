// models/fire_emergency.js
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var schema = mongoose.Schema(
  {
    priority: String,
    type: String,
    group_id: String,
    barcode: { $type: Schema.Types.ObjectId, ref: "Barcode" }
  },
  {
    typeKey: "$type"
  }
);

module.exports = mongoose.model("FireEmergency", schema);

// sample fire_emergency.json:
//
// [
//   {
//     "priority": "1",
//     "type": "escape_path",
//     "group_id": "1",
//     "barcode": "017.018"
//   },
//   {
//     "priority": "1",
//     "type": "escape_path",
//     "group_id": "1",
//     "barcode": "017.017"
//   },
//   {
//     "priority": "1",
//     "type": "escape_path",
//     "group_id": "1",
//     "barcode": "018.018"
//   },
//   {
//     "priority": "1",
//     "type": "escape_path",
//     "group_id": "1",
//     "barcode": "018.017"
//   },
//   { "priority": "0", "type": "shutter", "group_id": "2", "barcode": "017.015" },
//   { "priority": "0", "type": "shutter", "group_id": "2", "barcode": "018.015" }
// ]
