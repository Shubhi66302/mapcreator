import { fromJS } from "immutable";
import { normalizeMap } from "utils/normalizr";
import vanilla3x3 from "test-data/test-maps/3x3-vanilla.json";

import shiftBarcode, {
  shiftNeighboursAndUpdateSizeinfo,
  breakConnectionInDirection
} from "./shift-barcode";

const vanilla3x3BarcodeMap = fromJS(normalizeMap(vanilla3x3).entities.barcode);

const makeState = immutableMap => immutableMap.toJS();
describe("shiftNeighboursAndUpdateSizeinfo", () => {
  describe("Correct, positive distances", () => {
    test("homogenous barcodes, right direction", () => {
      var b1 = { size_info: [500, 500, 500, 500] };
      var b2 = { size_info: [500, 500, 500, 500] };
      shiftNeighboursAndUpdateSizeinfo(b1, b2, 1, 100);
      expect(b1.size_info).toEqual([500, 450, 500, 500]);
      expect(b2.size_info).toEqual([500, 500, 500, 450]);
    });
    test("homogenous barcodes, up direction", () => {
      var b1 = { size_info: [500, 500, 500, 500] };
      var b2 = { size_info: [500, 500, 500, 500] };
      shiftNeighboursAndUpdateSizeinfo(b1, b2, 0, 200);
      expect(b1.size_info).toEqual([400, 500, 500, 500]);
      expect(b2.size_info).toEqual([500, 500, 400, 500]);
    });
    test("uneven split distances, left direction", () => {
      var b1 = { size_info: [500, 500, 500, 300] };
      var b2 = { size_info: [500, 700, 500, 500] };
      shiftNeighboursAndUpdateSizeinfo(b1, b2, 3, 200);
      // TODO: this converts unequal split to an equal split, is this ok?
      expect(b1.size_info).toEqual([500, 500, 500, 400]);
      expect(b2.size_info).toEqual([500, 400, 500, 500]);
    });
    test("odd distance in between after shift", () => {
      var b1 = { size_info: [500, 500, 500, 300] };
      var b2 = { size_info: [500, 700, 500, 500] };
      shiftNeighboursAndUpdateSizeinfo(b1, b2, 3, 99);
      expect(b1.size_info).toEqual([500, 500, 500, 450]);
      expect(b2.size_info).toEqual([500, 451, 500, 500]);
    });
  });
  describe("Correct, negative distances", () => {
    test("homogenous; right direction", () => {
      var b1 = { size_info: [500, 500, 500, 500] };
      var b2 = { size_info: [500, 500, 500, 500] };
      shiftNeighboursAndUpdateSizeinfo(b1, b2, 1, -100);
      expect(b1.size_info).toEqual([500, 550, 500, 500]);
      expect(b2.size_info).toEqual([500, 500, 500, 550]);
    });
  });
  test("Incorrect, positive distances", () => {
    var b1 = { size_info: [500, 500, 500, 500] };
    var b2 = { size_info: [500, 500, 500, 500] };
    expect(() =>
      shiftNeighboursAndUpdateSizeinfo(b1, b2, 1, 1100)
    ).toThrowError(/Cannot shift/);
  });
});

describe("breakConnectionInDirection", () => {
  test("should make [0,0,0] in case no adjacency", () => {
    var barcode = {
      coordinate: "1,1",
      neighbours: [[1, 1, 0], [1, 1, 1], [1, 1, 1], [1, 1, 1]]
    };
    breakConnectionInDirection(barcode, 1);
    expect(barcode).toEqual({
      coordinate: "1,1",
      neighbours: [[1, 1, 0], [0, 0, 0], [1, 1, 1], [1, 1, 1]]
    });
  });
  test("should make neighbour [0,0,0] and adjacency null", () => {
    var barcode = {
      coordinate: "1,1",
      neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
      adjacency: [[1, 0], [0, 1], [2, 1], [1, 2]]
    };
    breakConnectionInDirection(barcode, 1);
    expect(barcode).toEqual({
      coordinate: "1,1",
      neighbours: [[1, 1, 1], [0, 0, 0], [1, 1, 1], [1, 1, 1]],
      adjacency: [[1, 0], null, [2, 1], [1, 2]]
    });
  });
});

describe("shiftBarcode", () => {
  // since this is main use case right now (shifting pps barcode), testing it first
  test("horizontally shifting a periphery barcode", () => {
    var state = makeState(vanilla3x3BarcodeMap);
    // shifting 1,0 right by 200 (default sizeinfo is 750 in all sides)
    // 2,0  1,0 > 0,0
    // ...  1,1   ...
    // ...  ...   ...
    var newState = shiftBarcode(state, {
      type: "SHIFT-BARCODE",
      value: {
        tileId: "1,0",
        direction: 1,
        distance: 200
      }
    });
    // shifted barcode
    expect(newState["1,0"]).toMatchObject({
      coordinate: "1,0",
      neighbours: [[0, 0, 0], [1, 1, 1], [0, 0, 0], [1, 1, 1]],
      size_info: [750, 650, 750, 850]
    });
    // neighbours
    expect(newState["0,0"]).toMatchObject({
      coordinate: "0,0",
      neighbours: [[0, 0, 0], [0, 0, 0], [1, 1, 1], [1, 1, 1]],
      size_info: [750, 750, 750, 650]
    });
    expect(newState["1,1"]).toMatchObject({
      coordinate: "1,1",
      neighbours: [[0, 0, 0], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
      size_info: [750, 750, 750, 750]
    });
    expect(newState["2,0"]).toMatchObject({
      coordinate: "2,0",
      neighbours: [[0, 0, 0], [1, 1, 1], [1, 1, 1], [0, 0, 0]],
      size_info: [750, 850, 750, 750]
    });
  });
  test("vertically shift the middle barcode", () => {
    var state = makeState(vanilla3x3BarcodeMap);
    // shifting 1,1 down by 200 (default sizeinfo is 750 in all sides)
    // 2,0  1,0   0,0
    // 2,1  1,1   0,1
    //       |
    // 2,2  1,2   0,2
    var newState = shiftBarcode(state, {
      type: "SHIFT-BARCODE",
      value: {
        tileId: "1,1",
        direction: 2,
        distance: 200
      }
    });
    // shifted barcode
    expect(newState["1,1"]).toMatchObject({
      coordinate: "1,1",
      neighbours: [[1, 1, 1], [0, 0, 0], [1, 1, 1], [0, 0, 0]],
      size_info: [850, 750, 650, 750]
    });
    // neighbours
    expect(newState["1,0"]).toMatchObject({
      coordinate: "1,0",
      neighbours: [[0, 0, 0], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
      size_info: [750, 750, 850, 750]
    });
    expect(newState["0,1"]).toMatchObject({
      coordinate: "0,1",
      neighbours: [[1, 1, 1], [0, 0, 0], [1, 1, 1], [0, 0, 0]],
      size_info: [750, 750, 750, 750]
    });
    expect(newState["1,2"]).toMatchObject({
      coordinate: "1,2",
      neighbours: [[1, 1, 1], [1, 1, 1], [0, 0, 0], [1, 1, 1]],
      size_info: [650, 750, 750, 750]
    });
    expect(newState["2,1"]).toMatchObject({
      coordinate: "2,1",
      neighbours: [[1, 1, 1], [0, 0, 0], [1, 1, 1], [0, 0, 0]],
      size_info: [750, 750, 750, 750]
    });
  });
});
