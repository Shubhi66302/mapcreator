import {
  addPPSQueue,
  addHighwayQueue,
  validateBarcodesFormAQueue
} from "./queue-barcodes";
import { fromJS } from "immutable";
import { normalizeMap } from "utils/normalizr";
import vanilla3x3 from "test-data/test-maps/3x3-vanilla.json";

const vanilla3x3BarcodeMap = fromJS(normalizeMap(vanilla3x3).entities.barcode);
const makeState = immutableMap => immutableMap.toJS();

describe("addPPSQueue", () => {
  // (kind of weird test case because we're no longer using pps information)
  test("should correctly modify multiple queue barcodes with neighbour changes when first queue coordinate is not next to pps", () => {
    // TODO: actually queues going straight into pps with turn are wrong and should not be made in the first place
    // but testing here just to confirm functionality anyway
    // map and queue:
    // x pps 4
    // x  2  5
    // x  1  x
    var state = makeState(vanilla3x3BarcodeMap);
    var action = {
      type: "ADD-QUEUE-BARCODES-TO-PPS",
      value: {
        pps_id: "1",
        coordinates: ["1,2", "1,1", "1,0", "0,0", "0,1"],
        pps_coordinate: "1,0"
      }
    };
    var newState = addPPSQueue(state, action);
    expect(newState["1,2"].neighbours).toEqual(state["1,2"].neighbours);
    expect(newState["1,1"].neighbours).toEqual([
      [1, 1, 1],
      [1, 1, 0],
      [1, 1, 0],
      [1, 1, 0]
    ]);
    expect(newState["1,0"].neighbours).toEqual([
      [0, 0, 0],
      [1, 1, 1],
      [1, 1, 0],
      [1, 1, 0]
    ]);
    expect(newState["0,0"].neighbours).toEqual([
      [0, 0, 0],
      [0, 0, 0],
      [1, 1, 1],
      [1, 1, 0]
    ]);
    expect(newState["0,1"].neighbours).toEqual([
      [1, 1, 0],
      [0, 0, 0],
      [1, 1, 1],
      [1, 1, 0]
    ]);
    expect(newState["2,2"].neighbours).toEqual([
      [1, 1, 1],
      [1, 1, 1],
      [0, 0, 0],
      [0, 0, 0]
    ]);
    expect(newState["2,1"].neighbours).toEqual([
      [1, 1, 1],
      [1, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ]);
    expect(newState["2,0"].neighbours).toEqual([
      [0, 0, 0],
      [1, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ]);
    // should NOT allow movement into queue exit from non-queue barcode
    expect(newState["0,2"].neighbours).toEqual([
      [1, 1, 0],
      [0, 0, 0],
      [0, 0, 0],
      [1, 1, 1]
    ]);
  });
  // (kind of weird test case because we're no longer using pps information)
  test("if first queue coordinate is next to pps, don't allow movement to pps", () => {
    // 3 pps 4
    // 2  1  x
    // x  x  x
    var state = makeState(vanilla3x3BarcodeMap);
    var action = {
      type: "ADD-QUEUE-BARCODES-TO-PPS",
      value: {
        pps_id: "1",
        coordinates: ["1,1", "2,1", "2,0", "1,0", "0,0"],
        pps_coordinate: "1,0"
      }
    };
    var newState = addPPSQueue(state, action);
    expect(newState["1,1"].neighbours).toEqual([
      [1, 1, 0],
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ]);
    expect(newState["2,1"].neighbours).toEqual([
      [1, 1, 1],
      [1, 1, 0],
      [1, 1, 0],
      [0, 0, 0]
    ]);
    expect(newState["2,0"].neighbours).toEqual([
      [0, 0, 0],
      [1, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ]);
    expect(newState["1,0"].neighbours).toEqual([
      [0, 0, 0],
      [1, 1, 1],
      [1, 1, 0],
      [1, 1, 0]
    ]);
    expect(newState["0,0"].neighbours).toEqual([
      [0, 0, 0],
      [0, 0, 0],
      [1, 1, 1],
      [1, 1, 0]
    ]);
    // other non queue neighbours
    expect(newState["2,2"].neighbours).toEqual([
      [1, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
      [0, 0, 0]
    ]);
    expect(newState["1,2"].neighbours).toEqual(state["1,2"].neighbours);
    expect(newState["0,2"].neighbours).toEqual(state["0,2"].neighbours);
    // NOT allowing entry into exit barcode from non-queue barcode
    expect(newState["0,1"].neighbours).toEqual([
      [1, 1, 0],
      [0, 0, 0],
      [1, 1, 1],
      [1, 1, 1]
    ]);
  });
  test("if first queue coordinate has some later queue coordinate(s) as neighbour, should not allow movement to it/them", () => {
    // 3  4 pps
    // 2  1  5
    // x  x  6
    var state = makeState(vanilla3x3BarcodeMap);
    var action = {
      type: "ADD-QUEUE-BARCODES-TO-PPS",
      value: {
        pps_id: "1",
        coordinates: ["1,1", "2,1", "2,0", "1,0", "0,0", "0,1", "0,2"],
        pps_coordinate: "0,0"
      }
    };
    var newState = addPPSQueue(state, action);
    // queue entry i.e. 1
    expect(newState["1,1"].neighbours).toEqual([
      [1, 1, 0],
      [1, 1, 0],
      [1, 1, 1],
      [1, 1, 1]
    ]);
    // checking some (not all) queue barcodes
    expect(newState["2,1"].neighbours).toEqual([
      [1, 1, 1],
      [1, 1, 0],
      [1, 1, 0],
      [0, 0, 0]
    ]);
    expect(newState["1,0"].neighbours).toEqual([
      [0, 0, 0],
      [1, 1, 1],
      [1, 1, 0],
      [1, 1, 0]
    ]);
    expect(newState["0,1"].neighbours).toEqual([
      [1, 1, 0],
      [0, 0, 0],
      [1, 1, 1],
      [1, 1, 0]
    ]);
    // queue exit opens up to all non queue barcodes
    expect(newState["0,2"].neighbours).toEqual([
      [1, 1, 0],
      [0, 0, 0],
      [0, 0, 0],
      [1, 1, 1]
    ]);
    // checking non queue barcodes
    expect(newState["2,2"].neighbours).toEqual([
      [1, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
      [0, 0, 0]
    ]);
    // NOT allowing non queue barcode to enter into exit barcode
    expect(newState["1,2"].neighbours).toEqual([
      [1, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
      [1, 1, 1]
    ]);
  });
  test("should not allow entry into exit barcode from any of its neighbours", () => {
    // pps 3  x
    //  2  x  x
    //  1  x  x
    var state = makeState(vanilla3x3BarcodeMap);
    var action = {
      type: "ADD-QUEUE-BARCODES-TO-PPS",
      value: {
        pps_id: "1",
        coordinates: ["2,2", "2,1", "2,0", "1,0"],
        pps_coordinate: "2,0"
      }
    };
    var newState = addPPSQueue(state, action);
    // just testing exit barcode and its neighbours
    // exit barcode
    expect(newState["1,0"].neighbours).toEqual([
      [0, 0, 0],
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 0]
    ]);
    // its neighbours
    expect(newState["0,0"].neighbours).toEqual([
      [0, 0, 0],
      [0, 0, 0],
      [1, 1, 1],
      [1, 1, 0]
    ]);
    expect(newState["1,1"].neighbours).toEqual([
      [1, 1, 0],
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 0]
    ]);
  });
});

describe("validateBarcodesFormAQueue", () => {
  // vanilla 3x3 state
  var state = makeState(vanilla3x3BarcodeMap);
  test("should be false when only 1 barcode selected", () => {
    const { error, reason } = validateBarcodesFormAQueue(["1,1"], state);
    expect(error).toBeTruthy();
    expect(reason).toEqual("Atleast 2 barcodes required");
  });
  test("should be false when 0 barcodes selected", () => {
    const { error, reason } = validateBarcodesFormAQueue([], state);
    expect(error).toBeTruthy();
    expect(reason).toEqual("Atleast 2 barcodes required");
  });
  test("should be false when barcodes selected in non-consecutive order", () => {
    // 3x3 vanilla map, queue barcodes are as
    // 1  3  2
    // x  x  x
    // x  x  x
    const { error, reason } = validateBarcodesFormAQueue(
      ["2,0", "0,0", "1,0"],
      state
    );
    expect(error).toBeTruthy();
    expect(reason).toEqual("Some barcodes are not consecutive or disconnected");
  });
  test("should be true when barcodes are selected in consecutive order", () => {
    // 3x3 vanilla map, queue barcodes are as
    // 1  2  3
    // x  5  4
    // x  x  x
    const { error, reason } = validateBarcodesFormAQueue(
      ["2,0", "1,0", "0,0", "0,1", "1,1"],
      state
    );
    expect(error).toBeFalsy();
    expect(reason).toBeFalsy();
  });
});

describe("addHighwayQueue", () => {
  describe("simple queue in 3x3 map", () => {
    // 3x3 vanilla map, queue barcodes are as
    // 1  2  3
    // x  5  4
    // x  x  x
    var state = makeState(vanilla3x3BarcodeMap);
    var action = {
      type: "ADD-QUEUE-BARCODES-TO-HIGHWAY",
      value: {
        coordinates: ["2,0", "1,0", "0,0", "0,1", "1,1"]
      }
    };
    var newState = addHighwayQueue(state, action);
    test("should disallow movement in non-queue directions for first n-1 barcodes", () => {
      // only right
      expect(newState["2,0"].neighbours).toEqual([
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0],
        [0, 0, 0]
      ]);
      // only right
      expect(newState["1,0"].neighbours).toEqual([
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0],
        [1, 0, 0]
      ]);
      // only down
      expect(newState["0,0"].neighbours).toEqual([
        [0, 0, 0],
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0]
      ]);
      // only left
      expect(newState["0,1"].neighbours).toEqual([
        [1, 0, 0],
        [0, 0, 0],
        [1, 0, 0],
        [1, 1, 1]
      ]);
    });
    test("for last queue barcode, should allow movement to all directions except backwards", () => {
      expect(newState["1,1"].neighbours).toEqual([
        [1, 1, 1],
        [1, 0, 0],
        [1, 1, 1],
        [1, 1, 1]
      ]);
    });
    test("all non-queue barcodes should remain untouched", () => {
      expect(newState["2,1"]).toEqual(state["2,1"]);
      expect(newState["2,2"]).toEqual(state["2,2"]);
      expect(newState["1,2"]).toEqual(state["1,2"]);
      expect(newState["0,2"]).toEqual(state["0,2"]);
    });
  });
});
