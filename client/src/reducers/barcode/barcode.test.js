import vanilla3x3 from "test-data/test-maps/3x3-vanilla.json";
import { normalizeMap } from "utils/normalizr";
import { fromJS } from "immutable";
import barcodeReducer from "./index";
import { createFloorFromCoordinateData } from "utils/util";
import _ from "lodash";

const vanilla3x3BarcodeMap = fromJS(normalizeMap(vanilla3x3).entities.barcode);
// TODO: this function has same name as test-helper/makeState, change to make less confusing
const makeState = immutableMap => immutableMap.toJS();

describe("TOGGLE-STORABLE", () => {
  test("should mark all coordinates as storable when makeStorable is 1", () => {
    var state = makeState(vanilla3x3BarcodeMap);
    var toBestorables = ["0,0", "1,0", "0,1", "1,1"];
    var nonStorables = ["2,0", "0,2", "2,1"];
    var newState = barcodeReducer(state, {
      type: "TOGGLE-STORABLE",
      value: { selectedTiles: toBestorables, makeStorable: 1 }
    });

    expect(newState["1,1"].store_status).toEqual(1);
    expect(newState["0,1"].store_status).toEqual(1);
    expect(newState["1,0"].store_status).toEqual(1);
    expect(newState["0,0"].store_status).toEqual(1);

    // Rest of the coordinates are left as is.
    for (let tileId of nonStorables) {
      expect(newState[tileId].store_status).toEqual(0);
    }
  });

  test("should mark all coordinates to non-storable when makeStorable is 0", () => {
    var state = makeState(vanilla3x3BarcodeMap);
    var alreadyStorables = ["0,0", "1,0", "0,1", "1,1"];
    var nonStorables = ["2,0", "0,2", "2,1"];
    var newState = barcodeReducer(state, {
      type: "TOGGLE-STORABLE",
      value: { selectedTiles: alreadyStorables, makeStorable: 0 }
    });

    expect(newState["1,1"].store_status).toEqual(0);
    expect(newState["0,1"].store_status).toEqual(0);
    expect(newState["1,0"].store_status).toEqual(0);
    expect(newState["0,0"].store_status).toEqual(0);

    // Rest of the coordinates are left as is.
    for (let tileId of nonStorables) {
      expect(newState[tileId].store_status).toEqual(0);
    }
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

describe("ADD-FLOOR", () => {
  test("should add floor barcodes", () => {
    var state = makeState(vanilla3x3BarcodeMap);
    var floorData = createFloorFromCoordinateData({
      floor_id: 2,
      row_start: 2,
      row_end: 3,
      column_start: 2,
      column_end: 3
    });
    var newState = barcodeReducer(state, {
      type: "ADD-FLOOR",
      value: floorData
    });
    var pairs = _.zip(
      floorData.map_values.map(barcode => barcode.coordinate),
      floorData.map_values
    );
    expect(newState).toEqual({
      ...state,
      ..._.fromPairs(pairs)
    });
  });
});

describe("ASSIGN-ZONE", () => {
  test("assign zone to selected tiles", () => {
    var state = makeState(vanilla3x3BarcodeMap);
    var newState = barcodeReducer(state, {
      type: "ASSIGN-ZONE",
      value: {
        zone_id: "new-zone-id",
        mapTiles: { "1,1": true, "2,2": true }
      }
    });
    expect(newState["1,1"].zone).toBe("new-zone-id");
    expect(newState["2,2"].zone).toBe("new-zone-id");
    expect(newState["0,1"].zone).toBe("defzone");
  });
});
