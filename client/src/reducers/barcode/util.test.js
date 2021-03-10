import { fromJS } from "immutable";
import { normalizeMap } from "utils/normalizr";
import vanilla3x3 from "test-data/test-maps/3x3-vanilla.json";
import { getDirection } from "./util";
import { configureStore } from "../../store";
import {
  makeState as makeStateApp,
  singleFloorVanilla
} from "utils/test-helper";
import { addTransitBarcode } from "../../actions/barcode";

const vanilla3x3BarcodeMap = fromJS(normalizeMap(vanilla3x3).entities.barcode);
const makeState = immutableMap => immutableMap.toJS();

describe("getDirection", () => {
  test("should give 0 when source = 0,1 and destination = 0,0 for vanilla map", () => {
    // map is
    // 2,0      1,0         0,0 <- (destination)
    // 2,1      1,1         0,1 <- (source)
    // 2,2      1,2         0,2
    var state = makeState(vanilla3x3BarcodeMap);
    const direction = getDirection("0,1", "0,0", state);
    expect(direction).toBe(0);
  });
  describe("with transit barcode in HORIZONTAL direction", () => {
    let state;
    beforeAll(async () => {
      // using transit barcode feature to make a new map for testing purpose
      var store = configureStore(
        makeStateApp(singleFloorVanilla, 1, { "1,1": true })
      );
      await store.dispatch(
        addTransitBarcode({
          tileId: "1,0",
          direction: 1,
          newBarcode: "003.003",
          sector: 0,
          distance: 750
        })
      );
      const appState = store.getState();
      // now map has transit barcode right to "1,0"
      // 2,0      1,0  999,1  0,0
      // 2,1      1,1         0,1
      // 2,2      1,2         0,2
      state = appState.normalizedMap.entities.barcode;
    });
    test("should be 1 for 1,0 -> 999", () => {
      const direction = getDirection("1,0", "999,1", state);
      expect(direction).toBe(1);
    });
    test("should be 3 for 999,1 -> 1,0", () => {
      const direction = getDirection("999,1", "1,0", state);
      expect(direction).toBe(3);
    });
    test("should be 1 for 999,1 -> 0,0", () => {
      const direction = getDirection("999,1", "0,0", state);
      expect(direction).toBe(1);
    });
  });
  describe("with transit barcode in VERTICAL direction", () => {
    let state;
    beforeAll(async () => {
      // using transit barcode feature to make a new map for testing purpose
      var store = configureStore(
        makeStateApp(singleFloorVanilla, 1, { "1,1": true })
      );
      await store.dispatch(
        addTransitBarcode({
          tileId: "1,1",
          direction: 0,
          newBarcode: "003.003",
          sector: 0,
          distance: 750
        })
      );
      const appState = store.getState();
      // now map has transit barcode above 1,1
      // 2,0      1,0         0,0
      //         999,1
      // 2,1      1,1         0,1
      // 2,2      1,2         0,2
      state = appState.normalizedMap.entities.barcode;
    });
    test("should be 2 for 1,0 -> 999", () => {
      const direction = getDirection("1,0", "999,1", state);
      expect(direction).toBe(2);
    });
    test("should be 0 for 999,1 -> 1,0", () => {
      const direction = getDirection("999,1", "1,0", state);
      expect(direction).toBe(0);
    });
    test("should be 2 for 999,1 -> 1,1", () => {
      const direction = getDirection("999,1", "1,1", state);
      expect(direction).toBe(2);
    });
  });
});
