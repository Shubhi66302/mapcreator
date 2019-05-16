import {
  deleteChargerData,
  deletePPSQueue,
  deleteElevator
} from "./delete-entities";
import { configureStore } from "../../store";
import {
  makeState as makeStateApp,
  singleFloorVanilla,
  addQueueSelectedTilesToState
} from "utils/test-helper";
import { addChargers } from "actions/charger";
import { addPPSes } from "actions/pps.js";
import { addQueueBarcodes } from "actions/actions";

import vanilla3x3 from "test-data/test-maps/3x3-vanilla.json";
import { normalizeMap } from "utils/normalizr";
import { fromJS } from "immutable";
const vanilla3x3BarcodeMap = fromJS(normalizeMap(vanilla3x3).entities.barcode);
// TODO: this function has same name as test-helper/makeState, change to make less confusing
const makeState = immutableMap => immutableMap.toJS();

describe("deleteChargerData", () => {
  test("should delete charger related data in barcodes", async () => {
    var store = configureStore(
      // arguments are mapJson, currentFloor, selectedMapTiles
      makeStateApp(singleFloorVanilla, 1, { "1,1": true })
    );
    await store.dispatch(addChargers({ charger_direction: 0 }));
    const state = store.getState();
    var initialState = state.normalizedMap.entities.barcode;
    var newState = deleteChargerData(initialState, {
      type: "DELETE-CHARGER-DATA",
      value: { chargerDetails: state.normalizedMap.entities.charger[1] }
    });
    // Sp coordinate(enrty point coordinate) is 500,500
    // Charger coordinate is "1,1"
    // Previously connected coordinate to 1,1 is 1,0
    expect(newState["500,500"]).toBe(undefined);
    expect(newState["1,1"].adjacency).toBe(undefined);
    // Neighbours of charger should not have adjacency (added while adding charger)
    expect(newState["2,1"].adjacency).toBe(undefined);
    expect(newState["1,2"].adjacency).toBe(undefined);
    expect(newState["0,1"].adjacency).toBe(undefined);

    expect(newState["1,1"].neighbours).toEqual([
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ]);
    expect(newState["1,0"].adjacency).toBe(undefined);
    // check neighbour structure of all old neighbours of charger
    expect(newState["1,0"].neighbours).toEqual([
      [0, 0, 0],
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ]);
    expect(newState["0,1"].neighbours).toEqual([
      [1, 1, 1],
      [0, 0, 0],
      [1, 1, 1],
      [1, 1, 1]
    ]);
    expect(newState["1,2"].neighbours).toEqual([
      [1, 1, 1],
      [1, 1, 1],
      [0, 0, 0],
      [1, 1, 1]
    ]);
    expect(newState["2,1"].neighbours).toEqual([
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
      [0, 0, 0]
    ]);
    expect(newState["1,1"].size_info).toEqual([750, 750, 750, 750]);
    expect(newState["1,0"].size_info).toEqual([750, 750, 750, 750]);
  });
});

describe("deletePPSQueue", () => {
  test("should delete pps queue for the given Pps", async () => {
    var store = configureStore(
      makeStateApp(singleFloorVanilla, 1, { "1,0": true })
    );
    // Queue structure:
    /*
      000.002  ->  000.001 ->   000.000
        ^
        |
      001.002  <- 001.001(pps)  001.000
      002.002     002.001  ...
    */
    // add pps
    await store.dispatch(addPPSes({ pick_direction: 0 }));
    // select queue tiles
    addQueueSelectedTilesToState(store, ["1,1", "2,1", "2,0", "1,0", "0,0"]);
    // add queue
    await store.dispatch(addQueueBarcodes());

    var initialState = store.getState().normalizedMap.entities.barcode;

    var newState = deletePPSQueue(initialState, {
      type: "DELETE-PPS-QUEUE",
      value: { queue_coordinates: ["1,1", "2,1", "2,0", "1,0", "0,0"] }
    });
    expect(newState["1,1"].neighbours).toEqual([
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ]);
    expect(newState["2,1"].neighbours).toEqual([
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
      [0, 0, 0]
    ]);
    expect(newState["2,2"].neighbours).toEqual([
      [1, 1, 1],
      [1, 1, 1],
      [0, 0, 0],
      [0, 0, 0]
    ]);
    expect(newState["2,0"].neighbours).toEqual([
      [0, 0, 0],
      [1, 1, 1],
      [1, 1, 1],
      [0, 0, 0]
    ]);
    expect(newState["1,0"].neighbours).toEqual([
      [0, 0, 0],
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ]);
  });
});

describe("deleteElevator", () => {
  test("should change barcode value of the given coordinate to its original value", () => {
    const state = makeState(vanilla3x3BarcodeMap);
    state["2,1"].barcode = "100.100";
    state["0,2"].barcode = "200.200";
    var newState = deleteElevator(state, {
      type: "DELETE-ELEVATOR",
      value: { elevator_id: 1, coordinates_list: ["2,1", "0,2"] }
    });
    expect(newState["2,1"].barcode).toEqual("001.002");
    expect(newState["0,2"].barcode).toEqual("002.000");
  });
});
