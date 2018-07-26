// models/ods.js
var mongoose = require("mongoose");

var schema = mongoose.Schema({
  excluded: Boolean,
  ods_tuple: String
});

module.exports = mongoose.model("ODS", schema);

// sample ods_excluded_json:
// {"ods_excluded_list": [{"excluded": true, "ods_tuple": "017.017--3"}, {"excluded": true, "ods_tuple": "018.017--3"}]}
