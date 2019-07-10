import { fromJS } from "immutable";
import { normalizeMap } from "utils/normalizr";
import {makeState, singleFloorVanilla, singleFloor} from "utils/test-helper";
import vanilla3x3 from "test-data/test-maps/3x3-vanilla.json";
import complicated3x3 from "test-data/test-maps/3x3-with-pps-charger-fireemergencies.json";
import { modifyDistanceBetweenBarcodes } from "./distance-between-barcodes";
import {getTileIdsForDistanceTiles} from "utils/selectors";
const vanilla3x3BarcodeMap = fromJS(normalizeMap(vanilla3x3).entities.barcode);
const complicated3x3BarcodeMap = fromJS(
  normalizeMap(complicated3x3).entities.barcode
);
const makeBarcodeState = immutableMap => immutableMap.toJS();

describe("MODIFY-DISTANCE-BETWEEN-BARCODES", () => {
  test("should modify distances in given direction when only 1 column is selected", () => {
    var state = makeBarcodeState(vanilla3x3BarcodeMap);
    var globalState = makeState(singleFloorVanilla);
    const direction = 3;
    const distanceTiles = { "c-0": true };
    const tileIds = getTileIdsForDistanceTiles(distanceTiles, globalState, direction);
    var newState = modifyDistanceBetweenBarcodes(state, {
      type: "MODIFY-DISTANCE-BETWEEN-BARCODES",
      value: {
        distance: 100,
        tileIds,
        direction: 3
      }
    });
    // Affected column, Size will change in 3 direction
    expect(newState["0,0"].size_info).toEqual([750, 750, 750, 850]);
    expect(newState["0,1"].size_info).toEqual([750, 750, 750, 850]);
    expect(newState["0,2"].size_info).toEqual([750, 750, 750, 850]);

    // Unaffected column, right side
    expect(newState["1,0"].size_info).toEqual([750, 750, 750, 750]);
    expect(newState["1,1"].size_info).toEqual([750, 750, 750, 750]);
    expect(newState["1,2"].size_info).toEqual([750, 750, 750, 750]);
    expect(newState["2,0"].size_info).toEqual([750, 750, 750, 750]);
    expect(newState["2,1"].size_info).toEqual([750, 750, 750, 750]);
    expect(newState["2,2"].size_info).toEqual([750, 750, 750, 750]);
  });
  test("should modify distances in given direction for all columns when more than columns are selected", () => {
    var state = makeBarcodeState(vanilla3x3BarcodeMap);
    var globalState = makeState(singleFloorVanilla);
    const direction = 3;
    const distanceTiles = { "c-0": true, "c-1": true };
    const tileIds = getTileIdsForDistanceTiles(distanceTiles, globalState, direction);
    var newState = modifyDistanceBetweenBarcodes(state, {
      type: "MODIFY-DISTANCE-BETWEEN-BARCODES",
      value: {
        distance: -100,
        tileIds,
        direction: 3
      }
    });
    // Affected column
    // "c-0":  size in direction 3 will be changed
    expect(newState["0,0"].size_info).toEqual([750, 750, 750, 650]);
    expect(newState["0,1"].size_info).toEqual([750, 750, 750, 650]);
    expect(newState["0,2"].size_info).toEqual([750, 750, 750, 650]);
    // "c-1":  size in direction 3 will be changed
    expect(newState["1,0"].size_info).toEqual([750, 750, 750, 650]);
    expect(newState["1,1"].size_info).toEqual([750, 750, 750, 650]);
    expect(newState["1,2"].size_info).toEqual([750, 750, 750, 650]);

    // UnAffected column
    expect(newState["2,0"].size_info).toEqual([750, 750, 750, 750]);
    expect(newState["2,1"].size_info).toEqual([750, 750, 750, 750]);
    expect(newState["2,2"].size_info).toEqual([750, 750, 750, 750]);
  });
  test("should modify distances when special barcode row is selected", () => {
    var state = makeBarcodeState(complicated3x3BarcodeMap);
    var globalState = makeState(singleFloor);
    const distanceTiles = { "r-2": true }; // special barcode row
    const direction = 0;
    const tileIds = getTileIdsForDistanceTiles(distanceTiles, globalState, direction);
    var newState = modifyDistanceBetweenBarcodes(state, {
      type: "MODIFY-DISTANCE-BETWEEN-BARCODES",
      value: {
        distance: 100,
        tileIds,
        direction: 0
      }
    });
    //affected row (only one barcode)
    expect(state["12,12"].size_info).toEqual([205, 750, 205, 750]); //OLD size info
    expect(newState["12,12"].size_info).toEqual([305, 750, 205, 750]); // New size info
    // Unaffected row
    expect(state["2,1"].size_info).toEqual([750, 750, 885, 750]); //OLD size info
    expect(newState["2,1"].size_info).toEqual([750, 750, 885, 750]); //new size info
  });
  test("should throw error if modified size is lesser than 1", () => {
    var state = makeBarcodeState(vanilla3x3BarcodeMap);
    var globalState = makeState(singleFloorVanilla);
    const direction = 3;
    const distanceTiles = { "c-0": true };
    const tileIds = getTileIdsForDistanceTiles(distanceTiles, globalState, direction);
    expect(() => modifyDistanceBetweenBarcodes(state, {
      type: "MODIFY-DISTANCE-BETWEEN-BARCODES",
      value: {
        distance: -750,
        tileIds,
        direction: 3
      }
    })).toThrowError(/Cannot modify the distance of barcode 000.000 in direction because that would cause overlap/);
  });
});
