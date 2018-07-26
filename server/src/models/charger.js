// models/charger.js
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var schema = mongoose.Schema({
  charger_direction: Number,
  entry_point_direction: Number,
  charger_id: Number, // unique to the map?
  mode: String,
  reinit_point_direction: Number,
  entry_point_location: { type: Schema.Types.ObjectId, ref: "Barcode" },
  status: String,
  charger_location: { type: Schema.Types.ObjectId, ref: "Barcode" },
  reinit_point_location: { type: Schema.Types.ObjectId, ref: "Barcode" },
  charger_type: { type: String, required: true }
});

module.exports = mongoose.model("Charger", schema);

// charger.json:
//
// [
//   {
//     charger_direction: 3,
//     entry_point_direction: 3,
//     charger_id: 1,
//     mode: "manual",
//     reinit_point_direction: 3,
//     entry_point_location: "030.030",
//     status: "disconnected",
//     charger_location: "018.012",
//     reinit_point_location: "030.030"
//   },
//   {
//   "charger_location": "041.043",
//   "entry_point_location": "060.060",
//   "charger_direction": 0,
//   "entry_point_direction": 0,
//   "reinit_point_direction": 0,
//   "mode": "manual",
//   "charger_type": "rectangular_plate_charger",
//   "reinit_point_location": "060.060",
//   "charger_id": 3,
//   "status": "disconnected"
// }
// ];
