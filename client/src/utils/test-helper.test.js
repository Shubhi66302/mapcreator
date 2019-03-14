import { twoFloors, addQueueSelectedTilesToState } from "./test-helper";
import { singleFloorVanilla, makeState } from "./test-helper";
import { configureStore } from "../store";

describe("twoFloors", () => {
  test("should have two floors", () => {
    expect(twoFloors.getIn(["map", "floors"]).size).toBe(2);
    expect(twoFloors.getIn(["map", "floors", 1, "map_values"]).size).toBe(2);
  });
});

describe("addQueueSelectedTilesToState", () => {
  test("should add selected tiles to the app state", () => {
    var store = configureStore(makeState(singleFloorVanilla, 1));
    addQueueSelectedTilesToState(store, ["1,1", "2,1", "2,0", "1,0"]);
    var newState = store.getState();
    expect(newState.selection.queueMode).toBe(true);
    expect(newState.selection.mapTiles).toEqual({
      "1,1": 1,
      "2,1": 2,
      "2,0": 3,
      "1,0": 4
    });
  });
});