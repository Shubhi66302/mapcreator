// models/zone.js
var mongoose = require("mongoose");

var schema = mongoose.Schema({
  zone_id: String, // this is supposed to be the name of the zone as entered in map creator
  blocked: Boolean,
  paused: Boolean
});

module.exports = mongoose.model("Zone", schema);

// sample zone.json file
// we won't store it like this, this is just for output:
// the zone_id gets converted from zone name to number by python backend for some reason...
//
// [
//   {
//     "header": {
//       "content-type": "application/json",
//       "accept": "application/json"
//     },
//     "url": "/api/zonerec",
//     "data": [
//       { "zonerec": { "zone_id": 1, "blocked": false, "paused": false } },
//       { "zonerec": { "zone_id": 2, "blocked": false, "paused": false } }
//     ],
//     "type": "POST"
//   }
// ]
