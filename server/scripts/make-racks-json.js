/* eslint-disable */
import { Map } from "server/models/index";
var fs = require("fs");

(async (id, fileName, racktype = "11") => {
  if (!id || !fileName) {
    console.log("pass map id and file name.");
    return;
  }
  var map = await Map.findById(id);
  if (!map) {
    console.log("map not found");
    return;
  }
  const { map: mapObj } = map;
  // assuming single floor
  var racks = mapObj.floors[0].map_values
    .filter(barcode => barcode.store_status)
    .map((barcode, idx) => ({
      position: barcode.barcode,
      direction: 0,
      last_store_position: barcode.barcode,
      id: ("000" + (idx + 1)).slice(-3),
      racktype,
      reserved_store_position: "undefined",
      is_stored: true,
      lifted_butler_id: null
    }));
  fs.writeFileSync(fileName, JSON.stringify(racks, 2), "utf8");
  console.log("Done.");
})(process.argv[2], process.argv[3], process.argv[4]);
