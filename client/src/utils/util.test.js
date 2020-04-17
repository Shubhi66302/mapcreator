import {
  createFloorFromCoordinateData,
  createMapFromCoordinateData,
  encode_barcode,
  coordinateKeyToTupleOfIntegers,
  implicitCoordinateKeyToBarcode,
  getIdsForEntities,
  getNeighbouringBarcodes,
  getNeighbouringCoordinateKeys,
  getNeighbourTiles,
  tupleOfIntegersToCoordinateKey,
  addNeighbourToBarcode,
  deleteNeighbourFromBarcode,
  getNeighbouringBarcodesIncludingDisconnected,
  getNeighboursThatAllowAccess
} from "./util";
import { singleFloorVanilla, makeState } from "./test-helper";
import getLoadedAjv from "common/utils/get-loaded-ajv";

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

describe("createFloorFromCoordinateData", () => {
  test("create floor 2 that has all required keys", () => {
    var floor = createFloorFromCoordinateData({
      floor_id: 2,
      row_start: 0,
      row_end: 10,
      column_start: 0,
      column_end: 10
    });
    expect(floor).toMatchObject({
      floor_id: 2,
      chargers: [],
      ppses: [],
      odsExcludeds: [],
      dockPoints: [],
      fireEmergencies: []
    });
    expect(floor.map_values).toHaveLength(121);
  });
  test("create a single row floor; both top and bottom neighbours should be [0,0,0] for all barcodes!", () => {
    var floor = createFloorFromCoordinateData({
      floor_id: 1,
      row_start: 1,
      row_end: 1,
      column_start: 1,
      column_end: 10
    });
    expect(floor).toMatchObject({
      floor_id: 1,
      chargers: [],
      ppses: [],
      odsExcludeds: [],
      dockPoints: [],
      fireEmergencies: []
    });
    expect(floor.map_values).toHaveLength(10);
    // all coordinates have neighbours in direction 0 and 2 as [0,0,0]
    floor.map_values.forEach(({ neighbours }) => {
      expect(neighbours[0]).toEqual([0, 0, 0]);
      expect(neighbours[2]).toEqual([0, 0, 0]);
    });
  });
});

describe("createMapFromCoordinateData", () => {
  test("create map that passes json schema validation", () => {
    var map = createMapFromCoordinateData(0, 10, 0, 10);
    var result = mapValidate(map);
    expect(map.zones).toEqual([
      {
        zone_id: "defzone",
        blocked: false,
        paused: false
      }
    ]);
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

describe("getNeighbouringBarcodesIncludingDisconnected", () => {
  test("should give disconnected barcodes as well but not non existing barcode", () => {
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
    var neighbourBarcodes = getNeighbouringBarcodesIncludingDisconnected(
      "1,2",
      barcodesDict
    );
    expect(neighbourBarcodes).toMatchObject([
      {
        coordinate: "1,1",
        neighbours: [[0, 0, 0], [0, 0, 0], [1, 1, 0], [0, 0, 0]]
      },
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
  test("Should work with adjacency as well; adjacency will have 'null' but neighbour is [1,0,0]; should automatically interpret neighbour?", () => {
    var barcodesDict = {
      // 1,1 is adjacency, rest are normal; all are disconnected
      // 2,1 x 1,1 x 0,1
      // testing 1,1
      "2,1": {
        coordinate: "2,1",
        neighbours: [[0, 0, 0], [1, 0, 0], [0, 0, 0], [0, 0, 0]]
      },
      "1,1": {
        coordinate: "1,1",
        neighbours: [[0, 0, 0], [1, 0, 0], [0, 0, 0], [1, 0, 0]],
        adjacency: [null, null, null, null]
      },
      "0,1": {
        coordinate: "0,1",
        neighbours: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 0, 0]]
      }
    };
    var neighbourBarcodes = getNeighbouringBarcodesIncludingDisconnected(
      "1,1",
      barcodesDict
    );
    expect(neighbourBarcodes).toMatchObject([
      null,
      {
        coordinate: "0,1",
        neighbours: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 0, 0]]
      },
      null,
      {
        coordinate: "2,1",
        neighbours: [[0, 0, 0], [1, 0, 0], [0, 0, 0], [0, 0, 0]]
      }
    ]);
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

describe("getNeighboursThatAllowAccess", () => {
  test("if 2 neighbours allow access to the coordinate irrespective of movement from coordinate", () => {
    // map is:
    // -    1,1    -
    //         
    // 2,2  1,2  0,2
    var barcodesDict = makeState(singleFloorVanilla, 1).normalizedMap.entities
      .barcode;
    barcodesDict["1,2"].neighbours = [[1, 1, 0], [1, 0, 0], [0, 0, 0], [1, 0, 0]];
    barcodesDict["2,2"].neighbours[1] = [1, 1, 0];
    barcodesDict["1,1"].neighbours[2] = [1, 0, 0];
    var neighbourBarcodes = getNeighboursThatAllowAccess("1,2", barcodesDict);
    expect(neighbourBarcodes).toMatchObject([
      null,
      { "barcode": "002.000", "blocked": false, "botid": "null", "coordinate": "0,2", "neighbours": [[1, 1, 1], [0, 0, 0], [0, 0, 0], [1, 1, 1]], "size_info": [750, 750, 750, 750], "store_status": 0, "zone": "defzone" },
      null,
      { "barcode": "002.002", "blocked": false, "botid": "null", "coordinate": "2,2", "neighbours": [[1, 1, 1], [1, 1, 0], [0, 0, 0], [0, 0, 0]], "size_info": [750, 750, 750, 750], "store_status": 0, "zone": "defzone" }
    ]);
  });
  test("if only one neighbour allows access irrespective of movement from coordinate (allowed)", () => {
    // map is:
    // -    1,1    -
    //         
    // 2,2  1,2  0,2
    var barcodesDict = makeState(singleFloorVanilla, 1).normalizedMap.entities
      .barcode;
    barcodesDict["1,2"].neighbours = [[1, 1, 0], [1, 0, 0], [0, 0, 0], [1, 0, 0]];
    barcodesDict["2,2"].neighbours[1] = [1, 0, 0];
    barcodesDict["1,1"].neighbours[2] = [1, 1, 0];
    barcodesDict["0,2"].neighbours[3] = [1, 0, 0];
    var neighbourBarcodes = getNeighboursThatAllowAccess("1,2", barcodesDict);
    expect(neighbourBarcodes).toMatchObject([
      { "barcode": "001.001", "blocked": false, "botid": "null", "coordinate": "1,1", "neighbours": [[1, 1, 1], [1, 1, 1], [1, 1, 0], [1, 1, 1]], "size_info": [750, 750, 750, 750], "store_status": 0, "zone": "defzone" },
      null,
      null,
      null
    ]);
  });
  test("if only one neighbour allows access irrespective of movement from coordinate (not allowed)", () => {
    // map is:
    // -    1,1    -
    //         
    // 2,2  1,2  0,2
    var barcodesDict = makeState(singleFloorVanilla, 1).normalizedMap.entities
      .barcode;
    barcodesDict["1,2"].neighbours = [[1, 0, 0], [1, 0, 0], [0, 0, 0], [1, 0, 0]];
    barcodesDict["2,2"].neighbours[1] = [1, 0, 0];
    barcodesDict["1,1"].neighbours[2] = [1, 1, 0];
    barcodesDict["0,2"].neighbours[3] = [1, 0, 0];
    var neighbourBarcodes = getNeighboursThatAllowAccess("1,2", barcodesDict);
    expect(neighbourBarcodes).toMatchObject([
      { "barcode": "001.001", "blocked": false, "botid": "null", "coordinate": "1,1", "neighbours": [[1, 1, 1], [1, 1, 1], [1, 1, 0], [1, 1, 1]], "size_info": [750, 750, 750, 750], "store_status": 0, "zone": "defzone" },
      null,
      null,
      null
    ]);
  });
  test("if no neighbour neighbour allows access irrespective of movement from coordinate", () => {
    // map is:
    // -    1,1    -
    //         
    // 2,2  1,2  0,2
    var barcodesDict = makeState(singleFloorVanilla, 1).normalizedMap.entities
      .barcode;
    barcodesDict["1,2"].neighbours = [[1, 0, 0], [1, 0, 0], [0, 0, 0], [1, 0, 0]];
    barcodesDict["2,2"].neighbours[1] = [1, 0, 0];
    barcodesDict["1,1"].neighbours[2] = [1, 0, 0];
    barcodesDict["0,2"].neighbours[3] = [1, 0, 0];
    var neighbourBarcodes = getNeighboursThatAllowAccess("1,2", barcodesDict);
    expect(neighbourBarcodes).toMatchObject([
      null,
      null,
      null,
      null
    ]);
  });
});

// just copying from previous test but testing for coordinate keys instead of the whole barcode obj
describe("getNeighbouringCoordinateKeys", () => {
  test("should give correct neighbour coordinate keys for a corner barcode", () => {
    var barcodesDict = makeState(singleFloorVanilla, 1).normalizedMap.entities
      .barcode;
    var neighbourBarcodes = getNeighbouringCoordinateKeys("0,2", barcodesDict);
    expect(neighbourBarcodes).toMatchObject(["0,1", null, null, "1,2"]);
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
    var neighbourBarcodes = getNeighbouringCoordinateKeys("1,2", barcodesDict);
    expect(neighbourBarcodes).toMatchObject([null, "0,2", null, "2,2"]);
  });
  test("should give correct neighbours if adjacency is present", () => {
    var barcodesDict = {
      "2,2": { adjacency: [[12, 12], [1, 2], null, null] },
      "12,12": { coordinate: "12,12" },
      "2,1": { coordinate: "2,1" }
    };
    var neighbourBarcodes = getNeighbouringCoordinateKeys("2,2", barcodesDict);
    expect(neighbourBarcodes).toEqual(["12,12", null, null, null]);
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
