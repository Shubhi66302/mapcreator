// TODO: write more tests
import * as reducer from "./reducer";

describe("selectedTilesReducer", () => {
  const { selectedTilesReducer } = reducer;
  describe("CLICK-ON-TILE", () => {
    test("should add an unclicked tile", () => {
      var state = { "31,32": true };
      expect(
        selectedTilesReducer(state, {
          type: "CLICK-ON-TILE",
          value: "32,32"
        })
      ).toMatchObject({ ...state, "32,32": true });
    });
    test("should remove an already clicked tile", () => {
      var state = { "31,32": true, "33,32": true };
      expect(
        selectedTilesReducer(state, {
          type: "CLICK-ON-TILE",
          value: "31,32"
        })
      ).toMatchObject({ "33,32": true });
    });
  });
  describe("DRAG-END", () => {
    test("shouldn't do anything if no selected tiles", () => {
      var state = { "1,1": true, "2,2": true };
      var newState = selectedTilesReducer(state, {
        type: "DRAG-END",
        value: {}
      });
      expect(newState).toMatchObject(state);
    });
    test("should xor tiles if some tiles selected", () => {
      var state = { "1,1": true, "2,2": true, "2,3": true };
      var newState = selectedTilesReducer(state, {
        type: "DRAG-END",
        value: {
          selectedTiles: ["2,2", "4,4"]
        }
      });
      expect(newState).toMatchObject({
        "1,1": true,
        "2,3": true,
        "4,4": true
      });
    });
  });
});
