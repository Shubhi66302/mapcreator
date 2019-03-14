import floorReducer from "./floor";
import { configureStore } from "../store";
import { makeState, singleFloorVanilla } from "utils/test-helper";
import { addPPSes } from "actions/pps";

describe("ADD-ENTITIES-TO-FLOOR", () => {
  test("should adds a pps entity to an existing floor", () => {
    var state = { "1": { ppses: [] } };
    // 2 new pps entities are created
    var ppsEntityIds = [1, 2];

    var newState = floorReducer(state, {
      type: "ADD-ENTITIES-TO-FLOOR",
      value: {
        floorKey: "ppses",
        currentFloor: 1,
        ids: ppsEntityIds
      }
    });
    expect(newState).toEqual({ "1": { ppses: [1, 2] } });
  });

  test("should add ppses and update some existing ppses to an existing floor", () => {
    var state = { "1": { ppses: [2, 3] } };
    // 1 is added, 2, 3 are updated
    var ppsEntityIds = [1, 2, 3];

    var newState = floorReducer(state, {
      type: "ADD-ENTITIES-TO-FLOOR",
      value: {
        floorKey: "ppses",
        currentFloor: 1,
        ids: ppsEntityIds
      }
    });
    expect(newState).toEqual({ "1": { ppses: [2, 3, 1] } });
  });

  test("Sample test to show usage of redux store to generate initial state for test", async () => {
    // using actual store to create initial state
    var store = configureStore(
      // arguments are mapJson, currentFloor, selectedMapTiles
      makeState(singleFloorVanilla, 1, { "0,1": true, "0,0": true })
    );
    // need to use async/await because of thunk middleware.
    await store.dispatch(addPPSes({ pick_direction: 0 }, store.getState()));
    // take out floor slice from state
    var initialState = store.getState().normalizedMap.entities.floor;
    // 3 is added, 1 and 2 are updated
    var ppsEntityIds = [1, 2, 3];

    var newState = floorReducer(initialState, {
      type: "ADD-ENTITIES-TO-FLOOR",
      value: {
        floorKey: "ppses",
        currentFloor: 1,
        ids: ppsEntityIds
      }
    });
    expect(newState).toEqual({
      ...initialState,
      "1": { ...initialState["1"], ppses: [1, 2, 3] }
    });
  });

  test("should not add anything if floor doesn't axist", () => {
    var state = { "1": { ppses: [2, 3] } };

    var newState = floorReducer(state, {
      type: "ADD-ENTITIES-TO-FLOOR",
      value: {
        floorKey: "ppses",
        currentFloor: 2,
        ids: [3, 4]
      }
    });
    expect(newState).toEqual(state);
  });

  test("should add entities even if entities array didn't exist before", () => {
    var state = { "1": { chargers: [1, 2] } };

    var newState = floorReducer(state, {
      type: "ADD-ENTITIES-TO-FLOOR",
      value: {
        floorKey: "ppses",
        currentFloor: 1,
        ids: [1, 2, 3]
      }
    });
    expect(newState).toEqual({ "1": { chargers: [1, 2], ppses: [1, 2, 3] } });
  });
});

describe("REMOVE-ENTITIES-FROM-FLOOR", () => {
  test("should remove pps entities", () => {
    var state = { "1": { ppses: [1, 3, 4, 5, 6] } };
    // 2 to be removeed
    var ppsEntityIds = [1, 2, 3];

    var newState = floorReducer(state, {
      type: "REMOVE-ENTITIES-FROM-FLOOR",
      value: {
        floorKey: "ppses",
        currentFloor: 1,
        ids: ppsEntityIds
      }
    });
    expect(newState).toMatchObject({ "1": { ppses: [4, 5, 6] } });
  });
  test("should remove barcodes entities", () => {
    var state = { "1": { map_values: ["0,1", "0,2", "3,0", "4,0"] } };
    // 2 to be removeed
    var barcodeIds = ["0,2", "3,0", "5,0"];

    var newState = floorReducer(state, {
      type: "REMOVE-ENTITIES-FROM-FLOOR",
      value: {
        floorKey: "map_values",
        currentFloor: 1,
        ids: barcodeIds
      }
    });
    expect(newState).toMatchObject({ "1": { map_values: ["0,1", "4,0"] } });
  });
});

describe("ADD-FLOOR", () => {
  test("should add floor data", () => {
    var state = {
      "1": { map_values: ["0,1", "0,2", "3,0", "4,0"], chargers: [] }
    };
    var floorData = {
      floor_id: 2,
      chargers: [],
      map_values: [{ coordinate: "2,3" }, { coordinate: "4,5" }]
    };
    var newState = floorReducer(state, {
      type: "ADD-FLOOR",
      value: floorData
    });
    expect(newState).toEqual({
      ...state,
      "2": { ...floorData, map_values: ["2,3", "4,5"] }
    });
  });
});

describe("EDIT-BARCODE", () => {
  test("should replace old key with new key", () => {
    var state = {
      "1": { map_values: ["0,1", "0,2", "3,0", "12,12"] }
    };
    var newState = floorReducer(state, {
      type: "EDIT-BARCODE",
      value: { coordinate: "12,12", new_barcode: "090.013" }
    });
    expect(newState).toEqual({
      ...state,
      "1": { map_values: ["0,1", "0,2", "3,0", "13,90"] }
    });
  });

  test("should not change anything if key does not exist", () => {
    var state = {
      "1": { map_values: ["0,1", "0,2", "3,0"] }
    };
    var newState = floorReducer(state, {
      type: "EDIT-BARCODE",
      value: { coordinate: "12,12", new_barcode: "090.013" }
    });
    expect(newState).toEqual(state);
  });

  test("should update key on correct floor in multi-floor map", () => {
    var state = {
      "1": { map_values: ["0,1", "0,2", "3,0", "12,12"] },
      "2": { map_values: ["3,4", "5,6", "9,19"] }
    };
    var newState = floorReducer(state, {
      type: "EDIT-BARCODE",
      value: { coordinate: "5,6", new_barcode: "012.013" }
    });
    expect(newState).toEqual({
      ...state,
      "2": {
        map_values: ["3,4", "13,12", "9,19"]
      }
    });
  });

  describe("DELETE-CHARGER-DATA", () => {
    test("should delete charger and its special point", () => {
      var state = {
        "1": { map_values: ["12,12", "0,2", "3,0", "4,0"], chargers: [1,2] }
      };
      var newState = floorReducer(state, {
        type: "DELETE-CHARGER-DATA",
        value: {chargerDetails:
              {
                "charger_id": 1,
                "charger_location": "002.002",
                "entry_point_location": "012.012",
                "charger_type": "rectangular_plate_charger",
                "status": "disconnected",
                "mode": "manual",
                "reinit_point_direction": 0,
                "entry_point_direction": 0,
                "reinit_point_location": "012.012",
                "charger_direction": 0,
                "coordinate": "2,2"
              }
        }
      });
      expect(newState[1].map_values).toEqual(["0,2", "3,0", "4,0"]);
      expect(newState[1].chargers).toEqual([2]);
    });
    test("should delete charger and its special point from multifloor map", () => {
      var state = {
        "1": { map_values: ["12,12", "0,2", "3,0", "4,0"], chargers: [1,2] },
        "2": { map_values: ["500,500", "5,0", "6,0", "7,0"], chargers: [3,4] }
      };
      var newState = floorReducer(state, {
        type: "DELETE-CHARGER-DATA",
        value: {chargerDetails:
              {
                "charger_id": 3,
                "charger_location": "000.005",
                "entry_point_location": "500.500",
                "charger_type": "rectangular_plate_charger",
                "status": "disconnected",
                "mode": "manual",
                "reinit_point_direction": 0,
                "entry_point_direction": 0,
                "reinit_point_location": "500.500",
                "charger_direction": 0,
                "coordinate": "5,0"
              }
        }
      });
      expect(newState[1].map_values).toEqual(state[1].map_values);
      expect(newState[1].chargers).toEqual(state[1].chargers);
      expect(newState[2].map_values).toEqual([ "5,0", "6,0", "7,0"]);
      expect(newState[2].chargers).toEqual([4]);
    });
  });
  
  test("should delete pps from floor", () => {
    var state = {
      "1": { ppses: [1,2,3] }
    };
    var newState = floorReducer(state, {
      type: "DELETE-PPS-BY-ID",
      value: 1
    });
    expect(newState).toEqual({
      ...state,
      "1": {
        ppses: [2,3]
      }
    });
  });
});
