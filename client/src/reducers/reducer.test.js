// TODO: write more tests
import * as reducer from "./reducer";

describe("selectedMapTilesReducer", () => {
  const { selectedMapTilesReducer } = reducer;
  describe("CLICK-ON-MAP-TILE", () => {
    test("should add an unclicked tile", () => {
      var state = { "31,32": true };
      expect(
        selectedMapTilesReducer(state, {
          type: "CLICK-ON-MAP-TILE",
          value: "32,32"
        })
      ).toMatchObject({ ...state, "32,32": true });
    });
    test("should remove an already clicked tile", () => {
      var state = { "31,32": true, "33,32": true };
      expect(
        selectedMapTilesReducer(state, {
          type: "CLICK-ON-MAP-TILE",
          value: "31,32"
        })
      ).toMatchObject({ "33,32": true });
    });
  });
  /// this method should be moved to selectionReducer
  // describe("DRAG-END", () => {
  //   test("shouldn't do anything if no selected tiles", () => {
  //     var state = { "1,1": true, "2,2": true };
  //     var newState = selectedMapTilesReducer(state, {
  //       type: "DRAG-END",
  //       value: []
  //     });
  //     expect(newState).toMatchObject(state);
  //   });
  //   test("should xor tiles if some tiles selected", () => {
  //     var state = { "1,1": true, "2,2": true, "2,3": true };
  //     var newState = selectedMapTilesReducer(state, {
  //       type: "DRAG-END",
  //       value: ["2,2", "4,4"]
  //     });
  //     expect(newState).toMatchObject({
  //       "1,1": true,
  //       "2,3": true,
  //       "4,4": true
  //     });
  //   });
  // });
});

describe("xoredMap", () => {
  const { xoredMap } = reducer;
  test("should xor when keys are ints", () => {
    const theMap = { "0": true, "1": true };
    const keys = [1, 2];
    expect(xoredMap(theMap, keys)).toMatchObject({ "0": true, "2": true });
  });
});
