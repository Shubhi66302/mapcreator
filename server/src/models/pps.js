// models/pps.js
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var schema = mongoose.Schema({
  // local id
  pps_id: Number, // is only unique to map? so needs to start from 1?
  // this is actually dock_point ...
  put_docking_positions: [
    {
      exit_position: { type: Schema.Types.ObjectId, ref: "Barcode" },
      dock_sequence_number: Number,
      pptl_frame_type: String,
      position: { type: Schema.Types.ObjectId, ref: "Barcode" },
      wait_position: { type: Schema.Types.ObjectId, ref: "Barcode" },
      direction: Number
    }
  ],
  pick_direction: Number,
  pick_position: { type: Schema.Types.ObjectId, ref: "Barcode" },
  status: String,
  queue_barcodes: [{ type: Schema.Types.ObjectId, ref: "Barcode" }], // Need to save this as list of strings when converting to JSON!
  location: { type: Schema.Types.ObjectId, ref: "Barcode" },
  pps_url: String, // ???
  allowed_modes: { type: [String], required: true } // allowed values are ["put", "pick", "audit"]
});

module.exports = mongoose.model("PPS", schema);

// example pps.json:

// [
//   {
//     put_docking_positions: [
//       {
//         exit_position: "016.018",
//         dock_sequence_number: 1,
//         pptl_frame_type: "11",
//         position: "015.018",
//         wait_position: "014.018",
//         direction: 1
//       },
//       {
//         exit_position: "016.018",
//         dock_sequence_number: 1,
//         pptl_frame_type: "11",
//         position: "015.017",
//         wait_position: "014.018",
//         direction: 1
//       }
//     ],
//     pick_direction: 0,
//     pick_position: "011.012",
//     status: "disconnected",
//     queue_barcodes: [],
//     location: "011.012",
//     pps_id: 1,
//     pps_url: "http://localhost:8181/pps/1/api/"
//   },
//   {
//     put_docking_positions: [
//       {
//         exit_position: "016.018",
//         dock_sequence_number: 1,
//         pptl_frame_type: "11",
//         position: "015.018",
//         wait_position: "014.018",
//         direction: 1
//       },
//       {
//         exit_position: "016.018",
//         dock_sequence_number: 1,
//         pptl_frame_type: "11",
//         position: "015.017",
//         wait_position: "014.018",
//         direction: 1
//       }
//     ],
//     pick_direction: 0,
//     pick_position: "011.015",
//     status: "disconnected",
//     queue_barcodes: [],
//     location: "011.015",
//     pps_id: 2,
//     pps_url: "http://localhost:8181/pps/2/api/"
//   },
//   {
//     put_docking_positions: [],
//     pick_direction: 1,
//     pick_position: "014.010",
//     status: "disconnected",
//     queue_barcodes: [],
//     location: "014.010",
//     pps_id: 3,
//     pps_url: "http://localhost:8181/pps/3/api/",
//     allowed_modes: ["pick", "put", "audit"]
//   }
// ];
