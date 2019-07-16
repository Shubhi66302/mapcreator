import * as barcodeSelectors from "./barcode-selectors";
import { makeState, twoFloors, singleFloor } from "../test-helper";

describe("getCurrentFloorBarcodeIds", () => {
  test("should return special barcode tile also since sampleMapJson has one special", () => {
    var state = makeState(singleFloor);
    var tileIds = barcodeSelectors.getCurrentFloorBarcodeIds(state);
    expect(tileIds).toHaveLength(9);
  });
  test("should get 9 barcodes on first floor of 2 floor map", () => {
    var state = makeState(twoFloors, 1);
    var tileIds = barcodeSelectors.getCurrentFloorBarcodeIds(state);
    expect(tileIds).toHaveLength(9);
  });
  test("should get 2 barcode when on 2nd floor of 2 floor map", () => {
    var state = makeState(twoFloors, 2);
    var tileIds = barcodeSelectors.getCurrentFloorBarcodeIds(state);
    expect(tileIds).toHaveLength(2);
    expect(tileIds).toEqual(["15,12", "11,17"]);
  });
});

describe("coordinateKeyToBarcodeSelector", () => {
  const { coordinateKeyToBarcodeSelector } = barcodeSelectors;
  test("should give correct barcode for a tile id", () => {
    var state = makeState(twoFloors, 2);
    var barcodeString = coordinateKeyToBarcodeSelector(state, {
      tileId: "15,12"
    });
    expect(barcodeString).toBe("012.015");
  });
  test("should give correct barcode for tile id when barcode string != tile id", () => {
    var state = makeState(twoFloors, 2);
    var barcodeString = coordinateKeyToBarcodeSelector(state, {
      tileId: "11,17"
    });
    expect(barcodeString).toBe("017.013");
  });
});

describe("currentFloorBarcodeToCoordinateMap", () => {
  const { currentFloorBarcodeToCoordinateMap } = barcodeSelectors;
  test("should compute a correct map for current floor barcodes", () => {
    var state = makeState(twoFloors, 2);
    var barcodeToCoordinateMap = currentFloorBarcodeToCoordinateMap(state);
    expect(barcodeToCoordinateMap).toMatchObject({
      "012.015": "15,12",
      "017.013": "11,17"
    });
  });
  test("should not recompute on repeated calls", () => {
    var state = makeState(twoFloors, 2);
    currentFloorBarcodeToCoordinateMap.resetRecomputations();
    // it's a single argument call, but adding a second argument shouldn't change things
    currentFloorBarcodeToCoordinateMap(state);
    currentFloorBarcodeToCoordinateMap(state, { barcode: "something" });
    currentFloorBarcodeToCoordinateMap(state, { barcode: "somethingelse" });
    currentFloorBarcodeToCoordinateMap(state, { notused: "ok" });
    expect(currentFloorBarcodeToCoordinateMap.recomputations()).toBe(1);
  });
});

describe("currentFloorBarcodeToCoordinateKeySelector", () => {
  const { currentFloorBarcodeToCoordinateKeySelector } = barcodeSelectors;
  test("should give correct coordinate for a barcode string", () => {
    var state = makeState(twoFloors, 2);
    var coordinate = currentFloorBarcodeToCoordinateKeySelector(state, {
      barcode: "012.015"
    });
    expect(coordinate).toBe("15,12");
  });
  test("should give correct coordinate when barcode does not match coordinate", () => {
    var state = makeState(twoFloors, 2);
    var coordinate = currentFloorBarcodeToCoordinateKeySelector(state, {
      barcode: "017.013"
    });
    expect(coordinate).toBe("11,17");
  });
  test("should return undefined when querying for a barcode that doesn't exist on current floor", () => {
    var state = makeState(twoFloors, 1);
    var coordinate = currentFloorBarcodeToCoordinateKeySelector(state, {
      barcode: "012.015"
    });
    expect(coordinate).toBeUndefined();
  });
});
