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
});
