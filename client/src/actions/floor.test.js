import { makeState, singleFloorVanilla } from "utils/test-helper";
import { createFloorFromCoordinateData } from "utils/util";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import * as actions from "./actions";
import { addFloor } from "./floor";

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe("addFloor", () => {
  test("should dispatch ADD-FLOOR when no already-existing barcodes are present", async () => {
    const initialState = makeState(singleFloorVanilla, 1);
    const store = mockStore(initialState);
    var coordinateData = {
      floor_id: 2,
      row_start: 3,
      row_end: 4,
      column_start: 3,
      column_end: 4
    };
    await store.dispatch(addFloor(coordinateData));
    const dispatchedActions = store.getActions();
    expect(dispatchedActions).toHaveLength(1);
    expect(dispatchedActions[0]).toEqual({
      type: "ADD-FLOOR",
      value: createFloorFromCoordinateData(coordinateData)
    });
  });
  test("should not dispatch anything when some overlap is there", async () => {
    const initialState = makeState(singleFloorVanilla, 1);
    const store = mockStore(initialState);
    var coordinateData = {
      floor_id: 2,
      row_start: 2,
      row_end: 4,
      column_start: 2,
      column_end: 4
    };
    await store.dispatch(addFloor(coordinateData));
    const dispatchedActions = store.getActions();
    expect(dispatchedActions).toHaveLength(0);
  });
});
