import { fromJS } from "immutable";
import { normalizeMap } from "utils/normalizr";
import complicated3x3 from "test-data/test-maps/3x3-with-pps-charger-fireemergencies.json";

const complicated3x3BarcodeMap = fromJS(
  normalizeMap(complicated3x3).entities.barcode
);
const makeState = immutableMap => immutableMap.toJS();

import { editBarcode } from "./edit-barcode";

describe("EDIT-BARCODE", () => {
  test("should change coordinate and barcode of exisitng special barcode", () => {
    const state = makeState(complicated3x3BarcodeMap);
    var new_state = editBarcode(state, {
      type: "EDIT-BARCODE",
      value: {
        coordinate: "12,12",
        new_barcode: "090.013"
      }
    });
    expect(new_state["12,12"]).toEqual(undefined);

    // check if barcode value is changed to new_barcode
    expect(new_state["13,90"].barcode).toEqual("090.013");
    // check if coordinate of new_barcode is changed to new_coordinate
    expect(new_state["13,90"].coordinate).toEqual("13,90");
    // neighbours of 13,90 should have new value, i.e. 13,90
    expect(new_state["2,1"].adjacency).toEqual([
      [2, 0],
      [1, 1],
      [13, 90],
      null
    ]);

    expect(new_state["2,2"].adjacency).toEqual([[13, 90], [1, 2], null, null]);
  });

  describe("EDIT-BARCODE", () => {
    test("should not do anything if special barcode to be replaced already exists", () => {
      const state = makeState(complicated3x3BarcodeMap);
      var new_state = editBarcode(state, {
        type: "EDIT-BARCODE",
        value: {
          coordinate: "12,12",
          new_barcode: "001.002"
        }
      });
      expect(new_state).toEqual(state);
    });
  });
});
