// models/map.js
// represents the overall map. will uses floor for storing the barcodes.
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

import { autoIncrement } from "mongoose-plugin-autoinc";

var schema = mongoose.Schema({
  name: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  elevators: [{ type: Schema.Types.ObjectId, ref: "Elevator" }],
  num_floors: { type: Number, default: 1 },
  // ppses etc. belong to map only since only one pps.json file is generated per map etc.
  ppses: [{ type: Schema.Types.ObjectId, ref: "PPS" }],
  chargers: [{ type: Schema.Types.ObjectId, ref: "Charger" }],
  // queue_data ?
  dock_points: [{ type: Schema.Types.ObjectId, ref: "DockPoint" }],
  zones: [{ type: Schema.Types.ObjectId, ref: "Zone" }],
  fire_emergencies: [{ type: Schema.Types.ObjectId, ref: "FireEmergency" }],
  odses: [{ type: Schema.Types.ObjectId, ref: "ODS" }]
});

schema.plugin(autoIncrement, "Map");
module.exports = mongoose.model("Map", schema);
