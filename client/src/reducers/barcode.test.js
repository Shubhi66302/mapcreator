import vanilla3x3 from "test-data/test-maps/3x3-vanilla.json";
import complicated3x3 from "test-data/test-maps/3x3-with-pps-charger-fireemergencies.json";
import { normalizeMap } from "utils/normalizr";
import { fromJS } from "immutable";
import barcodeReducer, { calculateDistances } from "./barcode.js";
import { getAllColumnTileIdTuples } from "utils/selectors";
import {createFloorFromCoordinateData} from "utils/util";
import _ from "lodash";

const vanilla3x3BarcodeMap = fromJS(normalizeMap(vanilla3x3).entities.barcode);
const complicated3x3BarcodeMap = fromJS(
  normalizeMap(complicated3x3).entities.barcode
);
// TODO: this function has same name as test-helper/makeState, change to make less confusing
const makeState = immutableMap => immutableMap.toJS();

describe("ASSIGN-STORABLE", () => {
  test("should correctly mutate barcodes so that neighbouring rack paths are not traversible", () => {
    var state = makeState(vanilla3x3BarcodeMap);
    // 2x2 square is selected
    var selectedMapTiles = {
      "0,0": true,
      "1,0": true,
      "0,1": true,
      "1,1": true
    };

    var newState = barcodeReducer(state, {
      type: "ASSIGN-STORABLE",
      value: selectedMapTiles
    });

    // check if storable is true for correct barcodes
    var nonStorables = ["2,2", "2,1", "2,0", "0,2", "1,2"];
    expect(newState["1,1"].store_status).toBe(1);
    expect(newState["0,1"].store_status).toBe(1);
    expect(newState["1,0"].store_status).toBe(1);
    expect(newState["0,0"].store_status).toBe(1);
    for (let tileId of nonStorables) {
      expect(newState[tileId].store_status).toBe(0);
    }
    // check neighbour structures of storables
    expect(newState["0,0"].neighbours).toEqual([
      [0, 0, 0],
      [0, 0, 0],
      [1, 1, 0],
      [1, 1, 0]
    ]);
    expect(newState["1,0"].neighbours).toEqual([
      [0, 0, 0],
      [1, 1, 0],
      [1, 1, 0],
      [1, 1, 1]
    ]);
    expect(newState["0,1"].neighbours).toEqual([
      [1, 1, 0],
      [0, 0, 0],
      [1, 1, 1],
      [1, 1, 0]
    ]);
    expect(newState["1,1"].neighbours).toEqual([
      [1, 1, 0],
      [1, 1, 0],
      [1, 1, 1],
      [1, 1, 1]
    ]);
    // check for other barcodes
    for (let tileId of nonStorables) {
      expect(newState[tileId].neighbours).toEqual(state[tileId].neighbours);
    }
  });
  test("should not modify neighbour structure when no storables are connected", () => {
    var state = makeState(vanilla3x3BarcodeMap);
    // 2 unconnected selected tiles
    var selectedMapTiles = { "0,0": true, "2,0": true };

    var newState = barcodeReducer(state, {
      type: "ASSIGN-STORABLE",
      value: selectedMapTiles
    });

    // check if storable is true
    for (let tileId of Object.keys(state)) {
      if (selectedMapTiles[tileId])
        expect(newState[tileId].store_status).toBe(1);
      else expect(newState[tileId].store_status).toBe(0);
    }
    // check neighbour structure
    for (let tileId of Object.keys(state)) {
      expect(newState[tileId].neighbours).toEqual(state[tileId].neighbours);
    }
  });
});

describe("ADD-QUEUE-BARCODES-TO-PPS", () => {
  test("should correctly modify multiple queue barcodes with neighbour changes", () => {
    var state = makeState(vanilla3x3BarcodeMap);
    var action = {
      type: "ADD-QUEUE-BARCODES-TO-PPS",
      value: {
        pps_id: "1",
        coordinates: ["1,2", "1,1", "1,0"]
      }
    };
    var newState = barcodeReducer(state, action);
    expect(newState["1,2"].neighbours).toMatchObject(state["1,2"].neighbours);

    expect(newState["1,1"].neighbours).toMatchObject([
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
      [1, 0, 0]
    ]);
    expect(newState["1,0"].neighbours).toMatchObject([
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
      [1, 1, 1]
    ]);
  });
});
describe("DELETE-BARCODE", () => {
  test("deleting a single barcode should update all its neighbours", () => {
    var state = makeState(vanilla3x3BarcodeMap);
    var tileIdMap = { "1,1": true };
    var newState = barcodeReducer(state, {
      type: "DELETE-BARCODES",
      value: tileIdMap
    });
    expect(newState["0,0"].neighbours).toEqual([
      [0, 0, 0],
      [0, 0, 0],
      [1, 1, 1],
      [1, 1, 1]
    ]);
    expect(newState["0,1"].neighbours).toEqual([
      [1, 1, 1],
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ]);
    expect(newState["0,2"].neighbours).toEqual([
      [1, 1, 1],
      [0, 0, 0],
      [0, 0, 0],
      [1, 1, 1]
    ]);
    expect(newState["1,2"].neighbours).toEqual([
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
      [1, 1, 1]
    ]);
    expect(newState["2,2"].neighbours).toEqual(state["2,2"].neighbours);
    expect(newState["2,1"].neighbours).toEqual([
      [1, 1, 1],
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ]);
    expect(newState["2,0"].neighbours).toEqual(state["2,0"].neighbours);
    expect(newState["1,1"]).not.toBeTruthy();
  });
  test("deleting multiple barcodes", () => {
    var state = makeState(vanilla3x3BarcodeMap);
    var tileIdMap = { "1,0": true, "1,2": true };
    var newState = barcodeReducer(state, {
      type: "DELETE-BARCODES",
      value: tileIdMap
    });
    expect(newState["1,0"]).not.toBeTruthy();
    expect(newState["1,2"]).not.toBeTruthy();
    // middle one is important
    expect(newState["1,1"].neighbours).toEqual([
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
      [1, 1, 1]
    ]);
  });
  // TODO: probably write some tests for adjacency barcodes
});

describe("MODIFY-DISTANCE-BETWEEN-BARCODES", () => {
  test("should modify neighbour distances when only 1 column is selected", () => {
    var state = makeState(vanilla3x3BarcodeMap);
    var newState = barcodeReducer(state, {
      type: "MODIFY-DISTANCE-BETWEEN-BARCODES",
      value: {
        distance: 200,
        tileBounds: { maxX: 2, minX: 0, maxY: 2, minY: 0 },
        distanceTiles: { "c-0": true },
        botWithRackThreshold: 750,
        botWithoutRackThreshold: 610
      }
    });
    expect(newState["0,0"].size_info).toEqual([750, 750, 750, 100]);
    expect(newState["0,1"].size_info).toEqual([750, 750, 750, 100]);
    expect(newState["0,2"].size_info).toEqual([750, 750, 750, 100]);

    expect(newState["1,0"].size_info).toEqual([750, 100, 750, 750]);
    expect(newState["1,1"].size_info).toEqual([750, 100, 750, 750]);
    expect(newState["1,2"].size_info).toEqual([750, 100, 750, 750]);

    expect(newState["2,0"].size_info).toEqual([750, 750, 750, 750]);
    expect(newState["2,1"].size_info).toEqual([750, 750, 750, 750]);
    expect(newState["2,2"].size_info).toEqual([750, 750, 750, 750]);
  });
  test("should modify neighbour distances when 1 row and 1 columns is selected", () => {
    var state = makeState(vanilla3x3BarcodeMap);
    var newState = barcodeReducer(state, {
      type: "MODIFY-DISTANCE-BETWEEN-BARCODES",
      value: {
        distance: 200,
        tileBounds: { maxX: 2, minX: 0, maxY: 2, minY: 0 },
        distanceTiles: { "c-0": true, "r-1": true },
        botWithRackThreshold: 750,
        botWithoutRackThreshold: 610
      }
    });
    expect(newState["0,0"].size_info).toEqual([750, 750, 750, 100]);
    expect(newState["0,1"].size_info).toEqual([750, 750, 100, 100]);
    expect(newState["0,2"].size_info).toEqual([100, 750, 750, 100]);

    expect(newState["1,0"].size_info).toEqual([750, 100, 750, 750]);
    expect(newState["1,1"].size_info).toEqual([750, 100, 100, 750]);
    expect(newState["1,2"].size_info).toEqual([100, 100, 750, 750]);

    expect(newState["2,0"].size_info).toEqual([750, 750, 750, 750]);
    expect(newState["2,1"].size_info).toEqual([750, 750, 100, 750]);
    expect(newState["2,2"].size_info).toEqual([100, 750, 750, 750]);
  });
  test("should not touch special barcode or their neighbours' distances", () => {
    var state = makeState(complicated3x3BarcodeMap);
    var newState = barcodeReducer(state, {
      type: "MODIFY-DISTANCE-BETWEEN-BARCODES",
      value: {
        distance: 200,
        tileBounds: { maxX: 2, minX: 0, maxY: 2, minY: 0 },
        distanceTiles: { "c-0": true, "r-1": true },
        botWithRackThreshold: 750,
        botWithoutRackThreshold: 610
      }
    });
    expect(newState["0,1"].size_info).toEqual([750, 750, 100, 100]);
    expect(newState["0,2"].size_info).toEqual([100, 750, 750, 100]);

    expect(newState["1,0"].size_info).toEqual([750, 100, 750, 750]);
    expect(newState["1,1"].size_info).toEqual([750, 100, 100, 750]);
    expect(newState["1,2"].size_info).toEqual([100, 100, 750, 750]);

    expect(newState["2,0"].size_info).toEqual([750, 750, 750, 750]);
    expect(newState["2,1"].size_info).toEqual(state["2,1"].size_info);
    expect(newState["2,2"].size_info).toEqual(state["2,2"].size_info);
  });
});

describe("ADD-FLOOR", () => {
  test("should add floor barcodes", () => {
    var state = makeState(vanilla3x3BarcodeMap);
    var floorData = createFloorFromCoordinateData({floor_id: 2, row_start: 2, row_end: 3, column_start: 2, column_end: 3});
    var newState = barcodeReducer(state, {
      type: "ADD-FLOOR",
      value: floorData
    });
    var pairs = _.zip(floorData.map_values.map(barcode => barcode.coordinate), floorData.map_values);
    expect(newState).toEqual({
      ...state,
      ..._.fromPairs(pairs)
    });
  });
});

describe("calculateDistances", () => {
  test("when no storables", () => {
    var barcodeDict = makeState(vanilla3x3BarcodeMap);
    var distances = calculateDistances(
      getAllColumnTileIdTuples({ maxY: 2, minY: 0 }, "c-0"),
      200,
      750,
      610,
      barcodeDict
    );
    expect(distances).toEqual([100, 100]);
  });
  test("when one storable in the center, and distance is small so taht smallDistance is negative", () => {
    var barcodeDict = makeState(vanilla3x3BarcodeMap);
    barcodeDict["1,1"].store_status = true;
    var distances = calculateDistances(
      getAllColumnTileIdTuples({ maxY: 2, minY: 0 }, "c-0"),
      200,
      750,
      610,
      barcodeDict
    );
    expect(distances).toEqual([100, 100]);
  });
  test("when one storable in center and smallDistance > botWithoutRackThreshold", () => {
    var barcodeDict = makeState(vanilla3x3BarcodeMap);
    barcodeDict["1,1"].store_status = true;
    var distances = calculateDistances(
      getAllColumnTileIdTuples({ maxY: 2, minY: 0 }, "c-0"),
      2000,
      750,
      610,
      barcodeDict
    );
    expect(distances).toEqual([750, 1250]);
  });
});
