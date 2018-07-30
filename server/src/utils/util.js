import _ from "lodash";

// return tuple of coordinate from string. expects correct input
export var parseCoordinateString = coordinateString => {
  var [_, x, y, ...rest] = /\[(.*), *(.*)\]$/gm.exec(coordinateString);
  return [parseInt(x), parseInt(y)];
};

// given a barcode string, finds the floor that contains it
// obviously assumes that same barcode string does not exist on multiple floors
export var findFloorIndex = (floors, barcodeString) =>
  _.findIndex(floors, ({ map_values }) =>
    map_values.some(barcode => barcode.barcode == barcodeString)
  );
