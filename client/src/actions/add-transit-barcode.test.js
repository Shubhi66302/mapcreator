import * as transitBarcodeUtils from "./add-transit-barcode";
import { getBarcodes } from "utils/selectors";
import { makeState, singleFloor, singleFloorVanilla, singleFloorVanillaDisAllowBotMovement } from "utils/test-helper";

describe("isValidNewBarcode", () => {
  const { isValidNewBarcode } = transitBarcodeUtils;
  test("should return false when given trnasit barcode value already exists in map", () => {
    var state = makeState(singleFloor, 1);
    expect(isValidNewBarcode("001.001", state)).toBeFalsy();
  });
  test("should return true when given trnasit barcode value doesn't exist in map", () => {
    var state = makeState(singleFloor, 1);
    expect(isValidNewBarcode("010.010", state)).toBeTruthy();
  });
});

describe("getUpdatedBarcodes", () => {
  const { getUpdatedBarcodes } = transitBarcodeUtils;
  var state = makeState(singleFloorVanilla, 1);
  const barcodeState = getBarcodes(state);
  // transit barcode right to "1,2"
  // 2,0      1,0         0,0
  // 2,1      1,1         0,1
  // 2,2      1,2   1,3   0,2
  const transitBarcodeInfo = {
    adjacency: [null, [0, 2], null, [1, 2]],
    barcode: "003.001",
    blocked: "false",
    botid: null,
    coordinate: "1,3",
    neighbours: [[0, 0, 0], [1, 1, 1], [0, 0, 0], [1, 1, 1]],
    size_info: [750, 375, 750, 375],
    store_status: 0,
    zone: "defzone"
  };
  const updatedBarcodes = getUpdatedBarcodes(
    transitBarcodeInfo,
    barcodeState,
    1
  );
  test("should return # of barcodes updated due to transit barcode addition", () => {
    expect(updatedBarcodes.length).toEqual(2);
  });
  test("should return correct barcode number of barcodes updated due to transit barcode addition", () => {
    expect(updatedBarcodes[0].barcode).toEqual("002.000");
    expect(updatedBarcodes[1].barcode).toEqual("002.001");
  });
  test("should return correct coordinate of barcodes updated due to transit barcode addition", () => {
    expect(updatedBarcodes[0].coordinate).toEqual("0,2");
    expect(updatedBarcodes[1].coordinate).toEqual("1,2");
  });
  test("should return correct neighbour structure of barcodes updated due to transit barcode addition", () => {
    expect(updatedBarcodes[0].neighbours).toEqual([
      [1, 1, 1],
      [0, 0, 0],
      [0, 0, 0],
      [1, 1, 1]
    ]);
    expect(updatedBarcodes[1].neighbours).toEqual([
      [1, 1, 1],
      [1, 1, 1],
      [0, 0, 0],
      [1, 1, 1]
    ]);
  });
  test("should return correct sizeinfo of barcodes updated due to transit barcode addition", () => {
    expect(updatedBarcodes[0].size_info).toEqual([750, 750, 750, 375]);
    expect(updatedBarcodes[1].size_info).toEqual([750, 375, 750, 750]);
  });
  test("should return correct adjacency of barcodes updated due to transit barcode addition", () => {
    expect(updatedBarcodes[0].adjacency).toEqual([[0, 1], null, null, [1, 3]]);
    expect(updatedBarcodes[1].adjacency).toEqual([
      [1, 1],
      [1, 3],
      null,
      [2, 2]
    ]);
  });
});

describe("getUpdatedBarcodes", () => {
  const { getUpdatedBarcodes } = transitBarcodeUtils;
  var state = makeState(singleFloorVanillaDisAllowBotMovement,1);
  const barcodeState = getBarcodes(state);
  // Map with one transit barcode
  // 2,0        1,0          0,0
  // 2,1        1,1          0,1
  // 2,2        1,2   1,3    0,2
  const transitBarcodeInfo = {
    adjacency: [null, [0, 2], null, [1, 2]],
    barcode: "003.001",
    blocked: "false",
    botid: null,
    coordinate: "1,3",
    neighbours: [[0, 0, 0], [1, 1, 1], [0, 0, 0], [1, 1, 1]],
    size_info: [750, 375, 750, 375],
    store_status: 0,
    zone: "defzone"
  };
  const updatedBarcodes = getUpdatedBarcodes(
    transitBarcodeInfo,
    barcodeState,
    1
  );
  test("should return # of barcodes updated due to transit barcode addition", () => {
    expect(updatedBarcodes.length).toEqual(2);
  });
  test("should return correct barcode number of barcodes updated due to transit barcode addition", () => {
    expect(updatedBarcodes[0].barcode).toEqual("002.000");
    expect(updatedBarcodes[1].barcode).toEqual("002.001");
  });
  test("should return correct coordinate of barcodes updated due to transit barcode addition", () => {
    expect(updatedBarcodes[0].coordinate).toEqual("0,2");
    expect(updatedBarcodes[1].coordinate).toEqual("1,2");
  });
  test("should return correct neighbour structure of barcodes updated due to transit barcode addition", () => {
    expect(updatedBarcodes[0].neighbours).toEqual([
      [1, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [1, 1, 1]
    ]);
    expect(updatedBarcodes[1].neighbours).toEqual([
      [1, 1, 1],
      [1, 1, 1],
      [0, 0, 0],
      [1, 1, 1]
    ]);
  });
  test("should return correct sizeinfo of barcodes updated due to transit barcode addition", () => {
    expect(updatedBarcodes[0].size_info).toEqual([750, 750, 750, 375]);
    expect(updatedBarcodes[1].size_info).toEqual([750, 375, 750, 750]);
  });
  test("should return correct adjacency of barcodes updated due to transit barcode addition when bot movement is dis-allowed", () => {
    expect(updatedBarcodes[0].adjacency).toEqual([[0, 1], null, null, [1, 3]]);
    expect(updatedBarcodes[1].adjacency).toEqual([
      [1, 1],
      [1, 3],
      null,
      [2, 2]
    ]);
  });
});
