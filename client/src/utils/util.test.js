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
  tupleOfIntegersToCoordinateKey
} from "./util";
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
    var tile = `7,6`;
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
  test("should give correct neighbour barcodes even with a missing neighbour", () => {
    var barcodesDict = { "2,0": "a", "1,1": "b", "2,2": "c", "2,1": "d" };
    var neighbourBarcodes = getNeighbouringBarcodes("2,1", barcodesDict);
    expect(neighbourBarcodes).toEqual(["a", "b", "c", undefined]);
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
