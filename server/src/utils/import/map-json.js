import Map from "server/src/models/map";
import Floor from "server/src/models/floor";
import Barcode from "server/src/models/barcode";

export default async (mapJson, name, created_on, updated_on) => {
  var map = await new Map({ name, created_on, updated_on }).save();
  var floors = await Promise.all(
    mapJson.map(async ({ map_values, floor_id }) => {
      // make floor
      var floor = await new Floor({ floor_id, _map: map._id }).save();
      // make Barcode documents
      var barcodes = await Promise.all(
        map_values.map(async barcodeJson => {
          var [_, x, y, ...rest] = /\[(.*), *(.*)\]$/gm.exec(
            barcodeJson.coordinate
          );
          return new Barcode({
            ...barcodeJson,
            _floor: floor._id,
            _map: map._id,
            coordinate: [parseInt(x), parseInt(y)]
          }).save();
        })
      );
      return floor;
    })
  );

  floors.forEach(floor => map.floors.push(floor._id));
  await map.save();
  return map._id;
};
