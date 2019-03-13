import { fromJS } from "immutable";
import { normalizeMap } from "utils/normalizr";
import vanilla3x3 from "test-data/test-maps/3x3-vanilla.json";
import complicated3x3 from "test-data/test-maps/3x3-with-pps-charger-fireemergencies.json";
import { modifyDistanceBetweenBarcodes } from "./distance-between-barcodes";

const vanilla3x3BarcodeMap = fromJS(normalizeMap(vanilla3x3).entities.barcode);
const complicated3x3BarcodeMap = fromJS(
  normalizeMap(complicated3x3).entities.barcode
);
const makeState = immutableMap => immutableMap.toJS();

describe("MODIFY-DISTANCE-BETWEEN-BARCODES", () => {
  test("should modify neighbour distances when only 1 column is selected", () => {
    var state = makeState(vanilla3x3BarcodeMap);
    var newState = modifyDistanceBetweenBarcodes(state, {
      type: "MODIFY-DISTANCE-BETWEEN-BARCODES",
      value: {
        distance: 200,
        tileBounds: { maxX: 2, minX: 0, maxY: 2, minY: 0 },
        distanceTiles: { "c-0": true }
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
    var newState = modifyDistanceBetweenBarcodes(state, {
      type: "MODIFY-DISTANCE-BETWEEN-BARCODES",
      value: {
        distance: 200,
        tileBounds: { maxX: 2, minX: 0, maxY: 2, minY: 0 },
        distanceTiles: { "c-0": true, "r-1": true }
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
    var newState = modifyDistanceBetweenBarcodes(state, {
      type: "MODIFY-DISTANCE-BETWEEN-BARCODES",
      value: {
        distance: 200,
        tileBounds: { maxX: 2, minX: 0, maxY: 2, minY: 0 },
        distanceTiles: { "c-0": true, "r-1": true }
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
