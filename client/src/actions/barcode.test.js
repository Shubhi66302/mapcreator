import * as barcode from "./barcode";
import * as actions from "./actions";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { makeState, singleFloorVanilla } from "utils/test-helper";
import { DEFAULT_BOT_WITH_RACK_THRESHOLD } from "../constants.js";

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe("addNewBarcode", () => {
  const { addNewBarcode, createNewBarcode } = barcode;
  test("should add barcode with one neighbour when adding to periphery", async () => {
    const { clearTiles } = actions;
    const initialState = makeState(singleFloorVanilla, 1);
    const store = mockStore(initialState);
    await store.dispatch(
      addNewBarcode({
        tileId: "2,2",
        direction: 2
      })
    );
    const dispatchedActions = store.getActions();
    expect(dispatchedActions).toHaveLength(3);
    expect(dispatchedActions[0]).toMatchObject({
      type: "ADD-MULTIPLE-BARCODE",
      value: [
        {
          ...initialState.normalizedMap.entities.barcode["2,2"],
          neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [0, 0, 0]]
        },
        createNewBarcode({
          coordinate: "2,3",
          neighbours: [[1, 1, 1], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
          barcode: "003.002",
          size_info: Array(4).fill(DEFAULT_BOT_WITH_RACK_THRESHOLD)
        })
      ]
    });
    expect(dispatchedActions[1]).toMatchObject({
      type: "ADD-ENTITIES-TO-FLOOR",
      value: {
        currentFloor: 1,
        floorKey: "map_values",
        ids: ["2,3"]
      }
    });
    expect(dispatchedActions[2]).toMatchObject(clearTiles);
  });
});
// TODO: test for removeBarcodes

describe("modifyDistanceBetweenBarcodes", () => {
  const { modifyDistanceBetweenBarcodes } = barcode;
  const { clearTiles } = actions;
  test("should dispatch action with all the required keys", async () => {
    const globalState = makeState(singleFloorVanilla, 1, {}, { "c-0": true });
    const store = mockStore(globalState);
    await store.dispatch(
      modifyDistanceBetweenBarcodes({
        distance: 200,
        direction: 3
      })
    );
    const tileIds = ["0,0", "0,1", "0,2"];
    const dispatchedActions = store.getActions();
    expect(dispatchedActions).toHaveLength(2);
    expect(dispatchedActions[0]).toEqual({
      type: "MODIFY-DISTANCE-BETWEEN-BARCODES",
      value: {
        distance: 200,
        tileIds,
        direction: 3
      }
    });
    expect(dispatchedActions[1]).toEqual(clearTiles);
  });
});
