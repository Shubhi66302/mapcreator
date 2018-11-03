import * as barcode from "./barcode";
import * as actions from "./actions";
import {
  currentFloorBotWithRackThreshold,
  currentFloorBotWithoutRackThreshold
} from "utils/selectors";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { makeState, singleFloorVanilla } from "utils/test-helper";
import _ from "lodash";

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
          size_info: Array(4).fill(
            currentFloorBotWithRackThreshold(initialState)
          )
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
  test("should add new barcode with size_info as set in metadata", async () => {
    const { clearTiles } = actions;
    const singleFloorVanillaWithModifiedThreshold = singleFloorVanilla.updateIn(
      ["map", "floors", 0, "metadata", "botWithRackThreshold"],
      () => 800
    );
    const initialState = makeState(singleFloorVanillaWithModifiedThreshold, 1);
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
          size_info: [750, 800, 800, 800]
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
