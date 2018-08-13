import assert from "assert";
import * as constants from "../constants";

export var handleErrors = response => {
  if (!response.ok) {
    return response.text().then(text => Promise.reject(text));
  }
  return response;
};

function stringify_number(input_number) {
  if (input_number < 10) {
    return "00".concat(input_number.toString());
  } else if (input_number < 100) {
    return "0".concat(input_number.toString());
  } else if (input_number < 1000) {
    return input_number.toString();
  } else {
    return undefined;
  }
}

export function encode_barcode(row, column) {
  var row_string = stringify_number(row);
  var column_string = stringify_number(column);
  return row_string.concat(".").concat(column_string);
}

export var barcodeToCoordinateKey = barcode => {
  // 002.013 => 13,2
  assert(/^\d\d\d\.\d\d\d$/.test(barcode));
  var row = parseInt(barcode.slice(0, 3));
  var col = parseInt(barcode.slice(4, 7));
  return `${col},${row}`;
};

export var coordinateKeyToTupleOfIntegers = coordinateKey => {
  // '12,3' => [12, 3]
  if (!/^\d*,\d*$/.test(coordinateKey)) {
    throw new Error(`${coordinateKey} does not match coordinateKey pattern.`);
  }
  return coordinateKey.split(",").map(val => parseInt(val));
};

export var coordinateKeyToBarcode = coordinateKey => {
  var [x, y] = coordinateKeyToTupleOfIntegers(coordinateKey);
  return encode_barcode(y, x);
};

export var tileToWorldCoordinate = (tileId, { minX, minY }) => {
  const coordinate = coordinateKeyToTupleOfIntegers(tileId);
  var xCoord = -(coordinate[0] - minX) * constants.TILE_WIDTH;
  var yCoord = (coordinate[1] - minY) * constants.TILE_HEIGHT;
  return { x: xCoord, y: yCoord };
};

// TODO: should make it so clicks between tiles are not registed as 'clicked'
// this would required actual dimensions of the sprite
export var worldToTileCoordinate = ({ x, y }, { minX, minY }) => {
  // need to match tileToWorldCoordinate exactly!
  var xTile = -x / constants.TILE_WIDTH + minX;
  var yTile = y / constants.TILE_HEIGHT + minY;
  // need to ceil xTile since tile is actually to the left of the coordinate
  return `${Math.ceil(xTile)},${parseInt(yTile)}`;
};

// gets unique ids for number of entities
//  existingEntities is map!
export const getIdsForEntities = (numEntities = 0, existingEntities = {}) => {
  var startId = Object.keys(existingEntities).length + 1;
  // https://stackoverflow.com/questions/36947847/how-to-generate-range-of-numbers-from-0-to-n-in-es2015-only
  return [...Array(numEntities).keys()].map(idx => idx + startId);
};

export var createMapFromCoordinateData = (
  row_start,
  row_end,
  column_start,
  column_end
) => {
  // be careful to satisfy json schema
  // iterate and fill up map_values
  var map_values = [];
  for (var row = row_start; row <= row_end; row++) {
    for (var column = column_start; column <= column_end; column++) {
      var barcode = encode_barcode(row, column);
      var unit = {
        store_status: 0,
        zone: "defzone",
        barcode,
        botid: "null",
        neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
        coordinate: `${column},${row}`,
        blocked: false,
        size_info: [750, 750, 750, 750]
      };
      if (row == row_start) {
        unit.neighbours[0] = [0, 0, 0];
      } else if (row == row_end) {
        unit.neighbours[2] = [0, 0, 0];
      }
      if (column == column_start) {
        unit.neighbours[1] = [0, 0, 0];
      } else if (column == column_end) {
        unit.neighbours[3] = [0, 0, 0];
      }
      map_values.push(unit);
    }
  }
  return {
    elevators: [],
    zones: [],
    queueDatas: [],
    floors: [
      {
        floor_id: 1,
        chargers: [],
        ppses: [],
        odses: [],
        dockPoints: [],
        fireEmergencies: [],
        map_values
      }
    ]
  };
};
