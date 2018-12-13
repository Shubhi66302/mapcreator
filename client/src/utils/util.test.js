import {
  createMapFromCoordinateData,
  encode_barcode,
  coordinateKeyToTupleOfIntegers,
  implicitCoordinateKeyToBarcode,
  tileToWorldCoordinate,
  worldToTileCoordinate,
  getIdsForEntities,
  getNeighbouringBarcodes,
  getNeighbourTiles,
  tupleOfIntegersToCoordinateKey,
  addNeighbourToBarcode,
  deleteNeighbourFromBarcode
} from "./util";
import { singleFloorVanilla, makeState } from "./test-helper";
import getLoadedAjv from "common/utils/get-loaded-ajv";
import * as constants from "../constants";

var ajv = getLoadedAjv();
var mapValidate = ajv.getSchema("map");

describe("encode_barcode", () => {
  test("single digit in row, double in column", () => {
    expect(encode_barcode(2, 22)).toBe("002.022");
  });
  test("both double digits (which is what is expected usually)", () => {
    expect(encode_barcode(10, 20)).toBe("010.020");
  });
});

describe("createMapFromCoordinateData", () => {
  test("create map that passes json schema validation", () => {
    var map = createMapFromCoordinateData(0, 10, 0, 10);
    var result = mapValidate(map);
    expect(mapValidate.errors).toBeNull();
    expect(result).toBe(true);
  });
});

describe("coordinateKeyToTupleOfIntegers", () => {
  test("good coordinateKey", () => {
    expect(coordinateKeyToTupleOfIntegers("12,15")).toEqual([12, 15]);
    expect(coordinateKeyToTupleOfIntegers("2,115")).toEqual([2, 115]);
  });
  test("bad coordinateKey", () => {
    expect(() => coordinateKeyToTupleOfIntegers("001.002")).toThrow();
    expect(() => coordinateKeyToTupleOfIntegers("15, 12")).toThrow();
    expect(() => coordinateKeyToTupleOfIntegers("[15,12]")).toThrow();
  });
});

describe("implicitCoordinateKeyToBarcode", () => {
  test("good stuff", () => {
    expect(implicitCoordinateKeyToBarcode("5,10")).toBe("010.005");
    expect(implicitCoordinateKeyToBarcode("10,10")).toBe("010.010");
  });
  test("bad stuff", () => {
    expect(() => implicitCoordinateKeyToBarcode("[10,5]")).toThrow();
  });
});

describe("getIdsForEntities", () => {
  test("good entitiees", () => {
    expect(
      getIdsForEntities(5, { "1": "someting", "2": "somehting else" })
    ).toEqual([3, 4, 5, 6, 7]);
  });
  test("empty entities", () => {
    expect(getIdsForEntities(5, undefined)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("tileToWorldCoordinate", () => {
  test("good stuff", () => {
    expect(
      tileToWorldCoordinate("1,2", { maxX: 2, maxY: 2, minX: 0, minY: 0 })
    ).toEqual({
      x: -1 * constants.TILE_WIDTH,
      y: 2 * constants.TILE_HEIGHT
    });
  });
});

describe("worldToTileCoordinate", () => {
  test("good stuff", () => {
    expect(
      worldToTileCoordinate(
        { x: -constants.TILE_WIDTH * 2, y: constants.TILE_HEIGHT * 3 },
        { maxX: 5, maxY: 5, minX: 0, minY: 1 }
      )
    ).toBe("2,4");
  });
  test("should be undefined if coordinate is between some tiles", () => {
    var { x: topLeftX, y: topLeftY } = tileToWorldCoordinate("2,4", {
      maxX: 5,
      maxY: 5,
      minX: 0,
      minY: 1
    });
    expect(
      worldToTileCoordinate(
        {
          x:
            topLeftX +
            (constants.TILE_WIDTH - constants.TILE_SPRITE_WIDTH) / 2 +
            constants.TILE_SPRITE_WIDTH,
          y: topLeftY
        },
        { maxX: 5, maxY: 5, minX: 0, minY: 1 }
      )
    ).toBeUndefined();
  });
});

describe("matching between tileToWorldCoordinate and worldToTileCoordinate", () => {
  // x = f1(f2(x))
  test("should match", () => {
    var tile = "7,6";
    var tileBounds = { maxX: 10, maxY: 20, minX: 5, minY: 2 };
    expect(
      worldToTileCoordinate(tileToWorldCoordinate(tile, tileBounds), tileBounds)
    ).toBe(tile);
  });
});

describe("tupleOfIntegersToCoordinateKey", () => {
  test("should give correct coordinateKey for tuple", () => {
    expect(tupleOfIntegersToCoordinateKey([0, 2])).toBe("0,2");
    expect(tupleOfIntegersToCoordinateKey([10, 2])).toBe("10,2");
  });
});

describe("getNeighbourTiles", () => {
  test("should give correct neighbour tiles", () => {
    var neighbourTiles = getNeighbourTiles("1,2");
    expect(neighbourTiles).toEqual(["1,1", "0,2", "1,3", "2,2"]);
  });
});

describe("getNeighbouringBarcodes", () => {
  test("should give correct neighbour barcodes for a corner barcode", () => {
    var barcodesDict = makeState(singleFloorVanilla, 1).normalizedMap.entities
      .barcode;
    var neighbourBarcodes = getNeighbouringBarcodes("0,2", barcodesDict);
    expect(neighbourBarcodes).toMatchObject([
      {
        store_status: 0,
        zone: "defzone",
        barcode: "001.000",
        botid: "null",
        neighbours: [[1, 1, 1], [0, 0, 0], [1, 1, 1], [1, 1, 1]],
        coordinate: "0,1",
        blocked: false,
        size_info: [750, 750, 750, 750]
      },
      null,
      null,
      {
        store_status: 0,
        zone: "defzone",
        barcode: "002.001",
        botid: "null",
        neighbours: [[1, 1, 1], [1, 1, 1], [0, 0, 0], [1, 1, 1]],
        coordinate: "1,2",
        blocked: false,
        size_info: [750, 750, 750, 750]
      }
    ]);
  });
  test("should give correct neighbour barcodes when neighbour is there but edge is [1,0,0]", () => {
    var barcodesDict = {
      // map is:
      // -      1,1    -
      //         x
      // 2,2 .. 1,2 .. 0,2
      // this one will be tested
      "1,2": {
        coordinate: "1,2",
        neighbours: [[1, 0, 0], [1, 1, 0], [0, 0, 0], [1, 1, 0]]
      },
      "1,1": {
        coordinate: "1,1",
        neighbours: [[0, 0, 0], [0, 0, 0], [1, 1, 0], [0, 0, 0]]
      },
      "0,2": {
        coordinate: "0,2",
        neighbours: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 1, 1]]
      },
      "2,2": {
        coordinate: "2,2",
        neighbours: [[0, 0, 0], [1, 1, 1], [0, 0, 0], [0, 0, 0]]
      }
    };
    var neighbourBarcodes = getNeighbouringBarcodes("1,2", barcodesDict);
    expect(neighbourBarcodes).toMatchObject([
      null,
      {
        coordinate: "0,2",
        neighbours: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 1, 1]]
      },
      null,
      {
        coordinate: "2,2",
        neighbours: [[0, 0, 0], [1, 1, 1], [0, 0, 0], [0, 0, 0]]
      }
    ]);
  });
  test("should give correct neighbours if adjacency is present", () => {
    var barcodesDict = {
      "2,2": { adjacency: [[12, 12], [1, 2], null, null] },
      "12,12": "a",
      "2,1": "c"
    };
    var neighbourBarcodes = getNeighbouringBarcodes("2,2", barcodesDict);
    expect(neighbourBarcodes).toEqual(["a", undefined, null, null]);
  });
});

describe("addNeighbourToBarcode", () => {
  test("should add to only neighbours array when no adjacency is present", () => {
    var barcode = {
      blocked: false,
      zone: "defzone",
      coordinate: "15,12",
      store_status: 0,
      barcode: "012.015",
      neighbours: [[0, 0, 0], [0, 0, 0], [1, 1, 0], [1, 1, 0]],
      size_info: [750, 750, 750, 750],
      botid: "null"
    };
    var newBarcode = addNeighbourToBarcode(barcode, 1, "15,11");
    expect(newBarcode).toMatchObject({
      blocked: false,
      zone: "defzone",
      coordinate: "15,12",
      store_status: 0,
      barcode: "012.015",
      neighbours: [[0, 0, 0], [1, 1, 1], [1, 1, 0], [1, 1, 0]],
      size_info: [750, 750, 750, 750],
      botid: "null"
    });
  });
  test("should add to both neighbours and adjacency when adjacency is present", () => {
    var barcode = {
      size_info: [205, 1000, 205, 1000],
      zone: "defzone",
      adjacency: [[2, 1], null, [2, 2], null],
      neighbours: [[1, 1, 0], [0, 0, 0], [1, 1, 0], [0, 0, 0]],
      store_status: 0,
      barcode: "012.012",
      blocked: false,
      botid: "null",
      special: true,
      coordinate: "12,12"
    };
    var newBarcode = addNeighbourToBarcode(barcode, 3, "3,2");
    expect(newBarcode).toMatchObject({
      size_info: [205, 1000, 205, 1000],
      zone: "defzone",
      adjacency: [[2, 1], null, [2, 2], [3, 2]],
      neighbours: [[1, 1, 0], [0, 0, 0], [1, 1, 0], [1, 1, 1]],
      store_status: 0,
      barcode: "012.012",
      blocked: false,
      botid: "null",
      special: true,
      coordinate: "12,12"
    });
  });
});

describe("deleteNeighbourFromBarcode", () => {
  var testingBarcode = {
    size_info: [205, 1000, 205, 1000],
    zone: "defzone",
    neighbours: [[1, 1, 0], [0, 0, 0], [1, 1, 0], [1, 1, 1]],
    store_status: 0,
    barcode: "012.012",
    blocked: false,
    botid: "null",
    special: true,
    coordinate: "12,12"
  };
  test("should delete a neighbour completely if it is told that neighbourt doesn't exist, also it doesn't have adjacency", () => {
    var newBarcode = deleteNeighbourFromBarcode(testingBarcode, 0, false);
    expect(newBarcode).toMatchObject({
      ...testingBarcode,
      neighbours: [[0, 0, 0], [0, 0, 0], [1, 1, 0], [1, 1, 1]]
    });
  });
  test("should delete correctly when there is adjacency and neighbour doesn't exist", () => {
    var withAdjacency = {
      ...testingBarcode,
      adjacency: [[2, 1], null, [2, 2], [3, 2]]
    };
    var newBarcode = deleteNeighbourFromBarcode(withAdjacency, 2, false);
    expect(newBarcode).toMatchObject({
      ...withAdjacency,
      neighbours: [[1, 1, 0], [0, 0, 0], [0, 0, 0], [1, 1, 1]],
      adjacency: [[2, 1], null, null, [3, 2]]
    });
  });
  test("should have deleted edge as [1,0,0] if neighbour exists", () => {
    var withAdjacency = {
      ...testingBarcode,
      adjacency: [[2, 1], null, [2, 2], [3, 2]]
    };
    var newBarcode = deleteNeighbourFromBarcode(withAdjacency, 0, true);
    expect(newBarcode).toMatchObject({
      ...withAdjacency,
      neighbours: [[1, 0, 0], [0, 0, 0], [1, 1, 0], [1, 1, 1]],
      adjacency: [null, null, [2, 2], [3, 2]]
    });
  });
  test("should not be mutating old object", () => {
    var newBarcode = deleteNeighbourFromBarcode(testingBarcode, 0, true);
    expect(newBarcode).not.toBe(testingBarcode);
  });
});
