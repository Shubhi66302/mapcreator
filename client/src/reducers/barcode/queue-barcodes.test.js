import { addQueueBarcodesToPps } from "./queue-barcodes";
import { fromJS } from "immutable";
import { normalizeMap } from "utils/normalizr";
import vanilla3x3 from "test-data/test-maps/3x3-vanilla.json";

const vanilla3x3BarcodeMap = fromJS(normalizeMap(vanilla3x3).entities.barcode);
const makeState = immutableMap => immutableMap.toJS();

describe("addQueueBarcodesToPps", () => {
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
    var newState = addQueueBarcodesToPps(state, action);
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
    var newState = addQueueBarcodesToPps(state, action);
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
    var newState = addQueueBarcodesToPps(state, action);
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
    var newState = addQueueBarcodesToPps(state, action);
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
