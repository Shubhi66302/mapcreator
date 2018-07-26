// models/dock_point.js
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var schema = mongoose.Schema({
  pps_list: [{ type: Schema.Types.ObjectId, ref: "PPS", required: true }],
  exit_position: String,
  dock_sequence_number: Number, // TODO: keeping these all number for now, will think of Long (mongoose-long) or integer later.
  pptl_frame_type: String, // should be number?
  position: String,
  wait_position: String,
  direction: Number
});

module.exports = mongoose.model("DockPoint", schema);

// example list of dock points:
//
// [
//   {
//     pps_list: [1, 2],
//     exit_position: "016.018",
//     dock_sequence_number: 1,
//     pptl_frame_type: "11",
//     position: "015.018",
//     wait_position: "014.018",
//     direction: 1
//   },
//   {
//     pps_list: [1, 2],
//     exit_position: "016.018",
//     dock_sequence_number: 1,
//     pptl_frame_type: "11",
//     position: "015.017",
//     wait_position: "014.018",
//     direction: 1
//   }
// ];
