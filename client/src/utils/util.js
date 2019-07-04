import * as constants from "../constants";
import _ from "lodash";

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

export function getDirection(SourceCoordinate, DestinationCoordinate) {
  var SourceX = parseInt(SourceCoordinate.split(",")[0]);
  var SourceY = parseInt(SourceCoordinate.split(",")[1]);
  var DestinationX = parseInt(DestinationCoordinate.split(",")[0]);
  var DestinationY = parseInt(DestinationCoordinate.split(",")[1]);
  var Dir = 5;
  if (DestinationY < SourceY) {
    Dir = 0;
  }
  if (DestinationX < SourceX) {
    Dir = 1;
  }
  if (DestinationY > SourceY) {
    Dir = 2;
  }
  if (DestinationX > SourceX) {
    Dir = 3;
  }

  return Dir;
}

export function encode_barcode(row, column) {
  var row_string = stringify_number(row);
  var column_string = stringify_number(column);
  return row_string.concat(".").concat(column_string);
}

// ordered array (top, right, left, down) of neighbour tiles
export const getNeighbourTiles = tileId => {
  var tileCoordinate = coordinateKeyToTupleOfIntegers(tileId);
  var neighbours = [];
  for (var delta of [[0, -1], [-1, 0], [0, 1], [1, 0]]) {
    var neighbour = [
      tileCoordinate[0] + delta[0],
      tileCoordinate[1] + delta[1]
    ];
    neighbours.push(tupleOfIntegersToCoordinateKey(neighbour));
  }
  return neighbours;
};

// can add filters to include [1,0,0] elements etc. using nbFilters array
// eg. if nbFilters = [[1,0,0], [0,0,0]], both of these kinds of neighbours will be excluded
// if nbFilters = [[0,0,0]], only non existing neighbours will be excluded, but [1,0,0] types will returned
export const getNeighbouringBarcodesWithNbFilter = (
  coordinateKey,
  barcodesDict,
  nbFilters
) => {
  // barcodesDict is state.normalizedMap.entities.barcode
  var curBarcode = barcodesDict[coordinateKey];
  if (!curBarcode) return null;
  // if adjacency is present, use that instead.
  if (curBarcode.adjacency) {
    return curBarcode.adjacency.map(val => {
      if (!val) return val;
      return barcodesDict[tupleOfIntegersToCoordinateKey(val)];
    });
  }
  var neighbourTileKeys = getNeighbourTiles(coordinateKey);
  return neighbourTileKeys.map((tileKey, idx) =>
    nbFilters.some(nbFilter => _.isEqual(nbFilter, curBarcode.neighbours[idx]))
      ? null
      : barcodesDict[tileKey]
  );
};
// considers [1,0,0] also
export const getNeighbouringBarcodesIncludingDisconnected = (
  coordinateKey,
  barcodesDict
) => {
  // barcodesDict is state.normalizedMap.entities.barcode
  var curBarcode = barcodesDict[coordinateKey];
  if (!curBarcode) return null;
  var neighbourTileKeys = getNeighbourTiles(coordinateKey);
  let nbBarcodes = [null, null, null, null];
  // if adjacency is present, use that.
  if (curBarcode.adjacency) {
    nbBarcodes = curBarcode.adjacency.map(val => {
      if (!val) return val;
      return barcodesDict[tupleOfIntegersToCoordinateKey(val)];
    });
  }
  // if nbBarcodes is null somewhere, then try to check if neighbour is [1,0,0]. If so, use tile key for that.
  [0, 1, 2, 3].forEach(idx => {
    if (nbBarcodes[idx] == null && curBarcode.neighbours[idx][0] == 1) {
      // assume its the tile key barcode
      nbBarcodes[idx] = barcodesDict[neighbourTileKeys[idx]];
    }
  });
  return nbBarcodes;
};
// only considers barcodes that are actually connected. i.e. [0,0,0] neighbours are assumed null
export const getNeighbouringBarcodes = (coordinateKey, barcodesDict) => {
  return getNeighbouringBarcodesWithNbFilter(coordinateKey, barcodesDict, [
    [0, 0, 0],
    [1, 0, 0]
  ]);
};

export var isValidCoordinateKey = coordinateKey =>
  /^\d*,\d*$/.test(coordinateKey);

export var coordinateKeyToTupleOfIntegers = coordinateKey => {
  // '12,3' => [12, 3]
  if (!isValidCoordinateKey(coordinateKey)) {
    throw new Error(`${coordinateKey} does not match coordinateKey pattern.`);
  }
  return coordinateKey.split(",").map(val => parseInt(val));
};

// implicit conversion. used for eg. getting new barcode's barcode
export var implicitCoordinateKeyToBarcode = coordinateKey => {
  var [x, y] = coordinateKeyToTupleOfIntegers(coordinateKey);
  return encode_barcode(y, x);
};

export var tupleOfIntegersToCoordinateKey = tuple => {
  return `${tuple[0]},${tuple[1]}`;
};

export var tileToWorldCoordinate = (tileId, { minX, minY }) => {
  const coordinate = coordinateKeyToTupleOfIntegers(tileId);
  var xCoord = -(coordinate[0] - minX) * constants.TILE_WIDTH;
  var yCoord = (coordinate[1] - minY) * constants.TILE_HEIGHT;
  return { x: xCoord, y: yCoord };
};

// clicks between tiles are not registed as 'clicked'
export var worldToTileCoordinate = ({ x, y }, { minX, minY }) => {
  // need to ceil xTile since tile is actually to the left of the coordinate
  var xTile = Math.ceil(-x / constants.TILE_WIDTH + minX);
  var yTile = parseInt(y / constants.TILE_HEIGHT + minY);
  var tileId = `${xTile},${yTile}`;
  // make sure valid coordinates
  try {
    var { x: tileTopLeftX, y: tileTopLeftY } = tileToWorldCoordinate(tileId, {
      minX,
      minY
    });
  } catch (error) {
    // not a valid coordinate
    return undefined;
  }
  // check if the world coordinate is within [TILE_SPRITE_WIDTH, TILE_SPRITE_HEIGHT] of the top left coordinate
  if (
    x <= tileTopLeftX + constants.TILE_SPRITE_WIDTH &&
    x >= tileTopLeftX &&
    y <= tileTopLeftY + constants.TILE_SPRITE_HEIGHT &&
    y >= tileTopLeftY
  )
    return tileId;
  return undefined;
};

// gets unique ids for number of entities
//  existingEntities is map!
export const getIdsForEntities = (numEntities = 0, existingEntities = {}) => {
  var startId = Object.keys(existingEntities).length + 1;
  // https://stackoverflow.com/questions/36947847/how-to-generate-range-of-numbers-from-0-to-n-in-es2015-only
  return [...Array(numEntities).keys()].map(idx => idx + startId);
};

export var createFloorFromCoordinateData = ({
  row_start,
  row_end,
  column_start,
  column_end,
  floor_id
}) => {
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
      } 
      if (row == row_end) {
        unit.neighbours[2] = [0, 0, 0];
      }
      if (column == column_start) {
        unit.neighbours[1] = [0, 0, 0];
      }  
      if (column == column_end) {
        unit.neighbours[3] = [0, 0, 0];
      }
      map_values.push(unit);
    }
  }
  return {
    floor_id,
    chargers: [],
    ppses: [],
    odsExcludeds: [],
    dockPoints: [],
    fireEmergencies: [],
    map_values
  };
};

export var createMapFromCoordinateData = (
  row_start,
  row_end,
  column_start,
  column_end
) => {
  return {
    elevators: [],
    // add default zone defzone
    zones: [
      {
        zone_id: "defzone",
        blocked: false,
        paused: false
      }
    ],
    queueDatas: [],
    floors: [
      createFloorFromCoordinateData({
        row_start,
        row_end,
        column_start,
        column_end,
        floor_id: 1
      })
    ]
  };
};

export const intersectRect = (r1, r2) =>
  !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );

export const addNeighbourToBarcode = (barcode, direction, nbCoordinate) => {
  const withoutAdjacency = {
    ...barcode,
    // https://medium.com/@giltayar/immutably-setting-a-value-in-a-js-array-or-how-an-array-is-also-an-object-55337f4d6702
    neighbours: Object.assign([...barcode.neighbours], {
      [direction]: [1, 1, 1]
    })
  };
  if (barcode.adjacency) {
    return {
      ...withoutAdjacency,
      adjacency: Object.assign([...barcode.adjacency], {
        [direction]: coordinateKeyToTupleOfIntegers(nbCoordinate)
      })
    };
  }
  return withoutAdjacency;
};

export const deleteNeighbourFromBarcode = (
  barcode,
  direction,
  doesNeighbourExist = false
) => {
  const withoutAdjacency = {
    ...barcode,
    neighbours: Object.assign([...barcode.neighbours], {
      [direction]: [doesNeighbourExist ? 1 : 0, 0, 0]
    })
  };
  if (barcode.adjacency) {
    return {
      ...withoutAdjacency,
      adjacency: Object.assign([...barcode.adjacency], {
        [direction]: null
      })
    };
  }
  return withoutAdjacency;
};

// Func used to convert barcode to coordinate.
// "500.143" => "143,500"
export const implicitBarcodeToCoordinate = barcode => {
  var [X, Y] = barcode.split(".");
  return parseInt(Y) + "," + parseInt(X);
};
