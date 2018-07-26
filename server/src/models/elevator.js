// models/elevator.js
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var EntryExitBarcodeSchema = mongoose.Schema({
  boom_barrier_id: String,
  // local floor id
  floor_id: Number,
  barcode: { type: Schema.Types.ObjectId, ref: "Barcode" } // here barcode refers to just the label, not the barcode object? nah
});

var schema = mongoose.Schema(
  {
    coordinate_list: [
      {
        direction: Number,
        // TODO: will have to convert barcode field to coordinate when making
        // json, see sample. basically backend gridinfo is keyed by coordinate
        // since barcode string is same for all elevator gridinfos
        // more convenient to have barcode ref here than coordinate.
        barcode: { $type: Schema.Types.ObjectId, ref: "Barcode" }
      }
    ],
    type: String,
    entry_barcodes: [EntryExitBarcodeSchema],
    exit_barcodes: [EntryExitBarcodeSchema],
    elevator_id: Number,
    position: String, // should be string as it is unique through all floors
    reinit_barcodes: [
      {
        barcodes: [{ $type: Schema.Types.ObjectId, ref: "Barcode" }],
        // local floor id
        floor_id: Number
      }
    ]
  },
  {
    typeKey: "$type"
  }
);

module.exports = mongoose.model("Elevator", schema);

// sample elevator.json
// [
//   {
//     "coordinate_list": [
//       { "direction": 2, "coordinate": [19, 16] },
//       { "direction": 2, "coordinate": [19, 16] }
//     ],
//     "type": "c_type",
//     "entry_barcodes": [
//       { "boom_barrier_id": 1, "floor_id": 1, "barcode": "015.019" }
//     ],
//     "exit_barcodes": [
//       { "boom_barrier_id": 3, "floor_id": 1, "barcode": "017.019" }
//     ],
//     "elevator_id": 1,
//     "position": "016.019",
//     "reinit_barcodes": [{ "barcodes": ["016.020"], "floor_id": 1 }]
//   }
// ]

// another sample
// [
//   {
//     "entry_barcodes": [
//       { "barcode": "015.019", "floor_id": 1, "boom_barrier_id": 1 },
//       { "barcode": "048.049", "floor_id": 2, "boom_barrier_id": 1 },
//       { "barcode": "017.011", "floor_id": 1, "boom_barrier_id": 2 }
//     ],
//     "coordinate_list": [
//       { "coordinate": [19, 16], "direction": 2 },
//       { "coordinate": [19, 16], "direction": 2 },
//       { "coordinate": [49, 47], "direction": 2 },
//       { "coordinate": [49, 47], "direction": 2 },
//       { "coordinate": [49, 47], "direction": 2 }
//     ],
//     "type": "c_type",
//     "position": "016.019",
//     "reinit_barcodes": [
//       { "barcodes": ["016.020"], "floor_id": 1 },
//       { "barcodes": [], "floor_id": 2 }
//     ],
//     "elevator_id": 1,
//     "exit_barcodes": [
//       { "barcode": "017.019", "floor_id": 1, "boom_barrier_id": 3 },
//       { "barcode": "047.048", "floor_id": 2, "boom_barrier_id": 4 }
//     ]
//   },
//   {
//     "entry_barcodes": [
//       { "barcode": "012.012", "floor_id": 1, "boom_barrier_id": 1 },
//       { "barcode": "042.042", "floor_id": 2, "boom_barrier_id": 1 }
//     ],
//     "coordinate_list": [
//       { "coordinate": [11, 12], "direction": 2 },
//       { "coordinate": [11, 12], "direction": 2 },
//       { "coordinate": [41, 42], "direction": 2 },
//       { "coordinate": [41, 42], "direction": 2 },
//       { "coordinate": [41, 42], "direction": 2 }
//     ],
//     "type": "c_type",
//     "position": "012.011",
//     "reinit_barcodes": [
//       { "barcodes": [], "floor_id": 1 },
//       { "barcodes": [], "floor_id": 2 }
//     ],
//     "elevator_id": 2,
//     "exit_barcodes": [
//       { "barcode": "012.010", "floor_id": 1, "boom_barrier_id": 2 },
//       { "barcode": "042.040", "floor_id": 2, "boom_barrier_id": 3 }
//     ]
//   }
// ]
