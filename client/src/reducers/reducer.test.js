// TODO: write more tests
import * as reducer from "./reducer";

// describe("selectedMapTilesReducer", () => {
//   const { selectedMapTilesReducer } = reducer;
//   describe("CLICK-ON-MAP-TILE", () => {
//     test("should add an unclicked tile", () => {
//       var state = { "31,32": true };
//       expect(
//         selectedMapTilesReducer(state, {
//           type: "CLICK-ON-MAP-TILE",
//           value: "32,32"
//         })
//       ).toMatchObject({ ...state, "32,32": true });
//     });
//     test("should remove an already clicked tile", () => {
//       var state = { "31,32": true, "33,32": true };
//       expect(
//         selectedMapTilesReducer(state, {
//           type: "CLICK-ON-MAP-TILE",
//           value: "31,32"
//         })
//       ).toMatchObject({ "33,32": true });
//     });
//   });

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
// });

describe("selectionReducer", () => {
  const { selectionReducer } = reducer;
  describe("CLICK_ON_MAP_TILE", () => {
    test("should select tile when queue mode is off and click on unselected tile", () => {
      var state = { mapTiles: {}, distanceTiles: {}, queueMode: false };
      var newState = selectionReducer(state, {
        type: "CLICK-ON-MAP-TILE",
        value: "32,32"
      });
      expect(newState).toMatchObject({
        mapTiles: { "32,32": true },
        distanceTiles: {},
        queueMode: false
      });
    });
    test("should unselect tile when queue mode is off and click on selected tile", () => {
      var state = { mapTiles: {"32,32": true , "31,31":true}, distanceTiles: {}, queueMode: false };
      var newState = selectionReducer(state, {
        type: "CLICK-ON-MAP-TILE",
        value: "32,32"
      });
      expect(newState).toMatchObject({
        mapTiles: { "31,31":true },
        distanceTiles: {},
        queueMode: false
      });
    });
    test("should select tile with order when queue mode is on and click on unselected tile", () => {
      var state = { mapTiles: {"32,32": 1 , "31,31":2}, distanceTiles: {}, queueMode: true };
      var newState = selectionReducer(state, {
        type: "CLICK-ON-MAP-TILE",
        value: "33,33"
      });
      expect(newState).toMatchObject({
        mapTiles: { "32,32": 1 , "31,31":2,"33,33":3 },
        distanceTiles: {},
        queueMode: true
      });
    });
    test("should not unselect tile with order when queue mode is on and click on selected tile", () => {
      var state = { mapTiles: {"32,32": 1 , "31,31":2}, distanceTiles: {}, queueMode: true };
      var newState = selectionReducer(state, {
        type: "CLICK-ON-MAP-TILE",
        value: "32,32"
      });
      expect(newState).toMatchObject({
        mapTiles: { "32,32": 1 , "31,31":2 },
        distanceTiles: {},
        queueMode: true
      });
    });
  });
});

describe("xoredMap", () => {
  const { xoredMap } = reducer;
  test("should xor when keys are ints", () => {
    const theMap = { "0": true, "1": true };
    const keys = [1, 2];
    expect(xoredMap(theMap, keys)).toMatchObject({ "0": true, "2": true });
  });
});

