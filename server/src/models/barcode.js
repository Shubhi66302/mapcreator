// models/barcode.js
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// verifies thing is either array of numbers of length n, or null
var arrayOfNNumbersOrNullValidator = n => ({
  validator: v => {
    if (v == null) return true;
    return v.every(x => typeof x === "number") && v.length == n;
  },
  message: "not null or array of numbers"
});

var schema = mongoose.Schema(
  {
    // TODO: should we have parents refs? yes, since we don't store array of barcode
    // refs in floor as #barcodes could be in millions
    // TODO: make an index on floor since we will need to fetch barcodes for a floor
    // a lot
    _map: { type: Number, ref: "Map" },
    _floor: { type: Schema.Types.ObjectId, ref: "Floor" },
    blocked: Boolean,
    zone: String,
    // TODO: make indexes on barcodes and coordinate since lots of queries on them?
    coordinate: { type: [Number], required: true }, // will convert to string when exporting jsons
    store_status: Number,
    barcode: { type: String, required: true }, // this is supposed to be what is displayed
    neighbours: [
      { type: Schema.Types.Mixed, validate: arrayOfNNumbersOrNullValidator(3) }
    ], // TODO: need to do validation on this to make sure its [[1]* 3] * 4
    size_info: [Number], // TODO: validation
    botid: String, // ?
    adjacency: {
      type: [
        {
          type: Schema.Types.Mixed,
          validate: arrayOfNNumbersOrNullValidator(2)
        }
      ],
      default: undefined
    }, // // TODO: should this be refs to barcodes?
    special: Boolean
  },
  {
    toObject: {},
    toJSON: {
      minimize: true,
      transform: (doc, ret) => {
        delete ret._map;
        delete ret._floor;
        delete ret._id;
        delete ret.__v;
        ret.coordinate = `[${ret.coordinate[0]},${ret.coordinate[1]}]`;
        return ret;
      }
    }
  }
);
module.exports = mongoose.model("Barcode", schema);

// sample barcodes from map.json:

// {
//         "blocked": false,
//         "zone": "defzone",
//         "coordinate": "[15,12]",
//         "store_status": 0,
//         "barcode": "012.015",
//         "neighbours": [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
//         "size_info": [750, 750, 750, 750],
//         "botid": "null"
//       },

// {
//                 "botid": "null",
//                 "blocked": false,
//                 "store_status": 0,
//                 "coordinate": "[11,16]",
//                 "zone": "defzone",
//                 "adjacency": [[11, 15], [10, 16], [11, 17], [31, 31]],
//                 "neighbours": [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 0]],
//                 "barcode": "016.011",
//                 "size_info": [750, 750, 750, 885]
//             },
