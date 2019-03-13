import { addQueueBarcodesToPps } from "./queue-barcodes";
import { fromJS } from "immutable";
import { normalizeMap } from "utils/normalizr";
import vanilla3x3 from "test-data/test-maps/3x3-vanilla.json";

const vanilla3x3BarcodeMap = fromJS(normalizeMap(vanilla3x3).entities.barcode);
const makeState = immutableMap => immutableMap.toJS();

describe("addQueueBarcodesToPps", () => {
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
      [1, 1, 1]
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
    expect(newState["0,2"].neighbours).toEqual([
      [1, 1, 1],
      [0, 0, 0],
      [0, 0, 0],
      [1, 1, 1]
    ]);
  });
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
  });
});
