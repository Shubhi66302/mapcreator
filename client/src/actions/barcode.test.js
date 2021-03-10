import * as barcode from "./barcode";
import * as actions from "./actions";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import { DEFAULT_BOT_WITH_RACK_THRESHOLD } from "../constants.js";
import { twoFloors } from "../utils/test-helper";
import { configureStore as configureRealStore} from "../store";

const middlewares = [thunk];
const mockStore = configureStore(middlewares);
import {
  makeState,
  singleFloorVanilla,
  singleFloorVanillaWithOneTransitBarcode,
  singleFloorVanillaWithTwoTransitBarcodes
} from "utils/test-helper";

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

describe("addNewMultipleBarcode", () => {
  const { addNewMultipleBarcode, createNewBarcode } = barcode;
  test("should add barcode with multiple neighbour when adding to periphery", async () => {
    const { clearTiles } = actions;
    const initialState = makeState(singleFloorVanilla, 1);
    const store = mockStore(initialState);
    await store.dispatch(
      addNewMultipleBarcode({
        direction: 2,
        tileId: "[\"2,2\"]"
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

describe("addTransitBarcode", () => {
  const { addTransitBarcode } = barcode;
  test("Should add transit barcode horizontally", async () => {
    const { clearTiles } = actions;
    const initialState = makeState(singleFloorVanilla, 1);
    const store = mockStore(initialState);
    await store.dispatch(
      addTransitBarcode({
        tileId: "1,1",
        direction: 1,
        newBarcode: "003.003",
        distance: 750
      })
    );
    const dispatchedActions = store.getActions();
    expect(dispatchedActions).toHaveLength(3);
    // expect(dispatchedActions[0]).toMatchObject({
    //   type: "ADD-MULTIPLE-BARCODE",
    //   value: [
    //     {
    //       ...initialState.normalizedMap.entities.barcode["0,1"],
    //       adjacency: [[0, 0], null, [0, 2], [999, 1]],
    //       size_info: [750, 750, 750, 375]
    //     },
    //     {
    //       ...initialState.normalizedMap.entities.barcode["1,1"],
    //       adjacency: [[1, 0], [999, 1], [1, 2], [2, 1]],
    //       size_info: [750, 375, 750, 750]
    //     },
    //     createNewBarcode({
    //       coordinate: "999,1",
    //       neighbours: [[0, 0, 0], [1, 1, 1], [0, 0, 0], [1, 1, 1]],
    //       barcode: "003.003",
    //       sector: 0,
    //       size_info: [750, 375, 750, 375],
    //       adjacency: [null, [0, 1], null, [1, 1]]
    //     })
    //   ]
    // });
    expect(dispatchedActions[1]).toMatchObject({
      type: "ADD-ENTITIES-TO-FLOOR",
      value: {
        currentFloor: 1,
        floorKey: "map_values",
        ids: ["999,1"]
      }
    });
    expect(dispatchedActions[2]).toMatchObject(clearTiles);
  });
  test("Should add transit barcode vertically", async () => {
    const { clearTiles } = actions;
    const initialState = makeState(singleFloorVanilla, 1);
    const store = mockStore(initialState);
    await store.dispatch(
      addTransitBarcode({
        tileId: "1,1",
        direction: 0,
        newBarcode: "003.003",
        distance: 750
      })
    );
    const dispatchedActions = store.getActions();
    expect(dispatchedActions).toHaveLength(3);
    // expect(dispatchedActions[0]).toMatchObject({
    //   type: "ADD-MULTIPLE-BARCODE",
    //   value: [
    //     {
    //       ...initialState.normalizedMap.entities.barcode["1,0"],
    //       adjacency: [null, [0, 0], [999, 1], [2, 0]],
    //       size_info: [750, 750, 375, 750]
    //     },
    //     {
    //       ...initialState.normalizedMap.entities.barcode["1,1"],
    //       adjacency: [[999, 1], [0, 1], [1, 2], [2, 1]],
    //       size_info: [375, 750, 750, 750]
    //     },
    //     createNewBarcode({
    //       coordinate: "999,1",
    //       neighbours: [[1, 1, 1], [0, 0, 0], [1, 1, 1], [0, 0, 0]],
    //       barcode: "003.003",
    //       sector: 0,
    //       size_info: [375, 750, 375, 750],
    //       adjacency: [[1, 0], null, [1, 1], null]
    //     })
    //   ]
    // });
    expect(dispatchedActions[1]).toMatchObject({
      type: "ADD-ENTITIES-TO-FLOOR",
      value: {
        currentFloor: 1,
        floorKey: "map_values",
        ids: ["999,1"]
      }
    });
    expect(dispatchedActions[2]).toMatchObject(clearTiles);
  });
  test("Should add and connect transit barcode with aligned barcode in perpendicular direction (when only one exist)", async () => {
    const stateWithOneTransitBarcode = makeState(
      singleFloorVanillaWithOneTransitBarcode,
      1
    );
    // Map with one transit barcode
    // 2,0        1,0    1,3     0,0
    // 2,1        1,1            0,1
    // 2,2        1,2            0,2
    const store = mockStore(stateWithOneTransitBarcode);
    // Map after adding new transit barcode
    // 2,0        1,0      1,3       0,0
    // 2,1        1,1    999,999     0,1
    // 2,2        1,2                0,2
    await store.dispatch(
      addTransitBarcode({
        tileId: "1,1",
        direction: 1,
        newBarcode: "003.003",
        distance: 750
      })
    );
    const dispatchedActions = store.getActions();
    expect(dispatchedActions).toHaveLength(3);
    // expect(dispatchedActions[0]).toMatchObject({
    //   type: "ADD-MULTIPLE-BARCODE",
    //   value: [
    //     {
    //       ...stateWithOneTransitBarcode.normalizedMap.entities.barcode["1,3"], // Old Transit barcode
    //       adjacency: [null, [0, 0], [999, 1], [1, 0]],
    //       neighbours: [[0, 0, 0], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
    //       size_info: [750, 375, 750, 375]
    //     },
    //     {
    //       ...stateWithOneTransitBarcode.normalizedMap.entities.barcode["0,1"],
    //       adjacency: [[0, 0], null, [0, 2], [999, 1]],
    //       size_info: [750, 750, 750, 375]
    //     },
    //     {
    //       ...stateWithOneTransitBarcode.normalizedMap.entities.barcode["1,1"],
    //       adjacency: [[1, 0], [999, 1], [1, 2], [2, 1]],
    //       sector: 0,
    //       size_info: [750, 375, 750, 750]
    //     },
    //     createNewBarcode({
    //       // New Transit barcode
    //       coordinate: "999,1",
    //       neighbours: [[1, 1, 1], [1, 1, 1], [0, 0, 0], [1, 1, 1]],
    //       barcode: "003.003",
    //       sector: 0,
    //       size_info: [750, 375, 750, 375],
    //       adjacency: [[1, 3], [0, 1], null, [1, 1]]
    //     })
    //   ]
    // });
  });
  test("Should add and connect transit barcode with aligned barcode in perpendicular direction (when both exist)", async () => {
    const stateWithTwoTransitBarcode = makeState(
      singleFloorVanillaWithTwoTransitBarcodes,
      1
    );
    // Map with two transit barcode
    // 2,0        1,0    1,3    0,0
    // 2,1        1,1           0,1
    // 2,2        1,2    1,4    0,2
    const store = mockStore(stateWithTwoTransitBarcode);
    // Map after adding a new transit barcode
    // 2,0        1,0      1,3      0,0
    // 2,1        1,1    999,999    0,1
    // 2,2        1,2      1,4      0,2
    await store.dispatch(
      addTransitBarcode({
        tileId: "1,1",
        direction: 1,
        newBarcode: "003.003",
        distance: 750
      })
    );
    const dispatchedActions = store.getActions();
    expect(dispatchedActions).toHaveLength(3);
    // expect(dispatchedActions[0]).toMatchObject({
    //   type: "ADD-MULTIPLE-BARCODE",
    //   value: [
    //     {
    //       ...stateWithTwoTransitBarcode.normalizedMap.entities.barcode["1,3"], // Old Transit barcode in 0 direction
    //       adjacency: [null, [0, 0], [999, 1], [1, 0]],
    //       neighbours: [[0, 0, 0], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
    //       size_info: [750, 375, 750, 375]
    //     },
    //     {
    //       ...stateWithTwoTransitBarcode.normalizedMap.entities.barcode["0,1"],
    //       adjacency: [[0, 0], null, [0, 2], [999, 1]],
    //       size_info: [750, 750, 750, 375]
    //     },
    //     {
    //       ...stateWithTwoTransitBarcode.normalizedMap.entities.barcode["1,4"], // Old Transit barcode in 1 direction
    //       adjacency: [[999, 1], [0, 2], null, [1, 2]],
    //       neighbours: [[1, 1, 1], [1, 1, 1], [0, 0, 0], [1, 1, 1]],
    //       size_info: [750, 375, 750, 375]
    //     },
    //     {
    //       ...stateWithTwoTransitBarcode.normalizedMap.entities.barcode["1,1"],
    //       adjacency: [[1, 0], [999, 1], [1, 2], [2, 1]],
    //       size_info: [750, 375, 750, 750]
    //     },
    //     createNewBarcode({
    //       // New Transit barcode
    //       coordinate: "999,1",
    //       neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]], // connected in all 4 directions
    //       barcode: "003.003",
    //       sector: 0,
    //       size_info: [750, 375, 750, 375],
    //       adjacency: [[1, 3], [0, 1], [1, 4], [1, 1]]
    //     })
    //   ]
    // });
  });
  test("Should add but not connect transit barcode with misaligned barcode in perpendicular direction", async () => {
    const stateWithOneTransitBarcode = makeState(
      singleFloorVanillaWithOneTransitBarcode,
      1
    );
    const store = mockStore(stateWithOneTransitBarcode);
    await store.dispatch(
      addTransitBarcode({
        tileId: "1,1",
        direction: 1,
        newBarcode: "003.003",
        distance: 800 // OLD transit barcode was added at distance 750
      })
    );
    // Map after adding a new transit barcode
    // 2,0          1,0    1,3         0,0
    // 2,1          1,1      999,999   0,1
    // 2,2          1,2                0,2
    // const dispatchedActions = store.getActions();
    // expect(dispatchedActions).toHaveLength(3);
    // expect(dispatchedActions[0]).toMatchObject({
    //   type: "ADD-MULTIPLE-BARCODE",
    //   value: [
    //     {
    //       ...stateWithOneTransitBarcode.normalizedMap.entities.barcode["0,1"],
    //       adjacency: [[0, 0], null, [0, 2], [999, 1]],
    //       size_info: [750, 750, 750, 350]
    //     },
    //     {
    //       ...stateWithOneTransitBarcode.normalizedMap.entities.barcode["1,1"],
    //       adjacency: [[1, 0], [999, 1], [1, 2], [2, 1]],
    //       size_info: [750, 400, 750, 750]
    //     },
    //     createNewBarcode({
    //       // New Transit barcode
    //       coordinate: "999,1",
    //       neighbours: [[0, 0, 0], [1, 1, 1], [0, 0, 0], [1, 1, 1]],
    //       barcode: "003.003",
    //       sector: 0,
    //       size_info: [750, 350, 750, 400],
    //       adjacency: [[1, 3], [0, 1], null, [1, 1]]
    //     })
    //   ]
    // });
  });
  test("Should add transit with neighbour structure in both directions same as the old neighbour structure b/w the 2 barcodes", async () => {
    const initialState = makeState(singleFloorVanilla, 1);
    // Modify neighbour structure in 1 direction for ref barcode
    initialState.normalizedMap.entities.barcode["1,1"].neighbours = [
      [1, 1, 1],
      [1, 1, 0],
      [1, 1, 1],
      [1, 1, 1]
    ];
    // Modify neighbour structure in 3 direction for old neighbour of ref barcode
    initialState.normalizedMap.entities.barcode["0,1"].neighbours = [
      [1, 1, 1],
      [0, 0, 0],
      [1, 1, 1],
      [1, 1, 0]
    ];
    const store = mockStore(initialState);
    await store.dispatch(
      addTransitBarcode({
        tileId: "1,1",
        direction: 1,
        newBarcode: "003.003",
        distance: 750
      })
    );
    //const dispatchedActions = store.getActions();
    // expect(dispatchedActions[0]).toMatchObject({
    //   type: "ADD-MULTIPLE-BARCODE",
    //   value: [
    //     {
    //       ...initialState.normalizedMap.entities.barcode["0,1"],
    //       adjacency: [[0, 0], null, [0, 2], [999, 1]],
    //       size_info: [750, 750, 750, 375]
    //     },
    //     {
    //       ...initialState.normalizedMap.entities.barcode["1,1"],
    //       adjacency: [[1, 0], [999, 1], [1, 2], [2, 1]],
    //       size_info: [750, 375, 750, 750]
    //     },
    //     createNewBarcode({
    //       coordinate: "999,1",
    //       neighbours: [[0, 0, 0], [1, 1, 0], [0, 0, 0], [1, 1, 0]],
    //       barcode: "003.003",
    //       sector: 0,
    //       size_info: [750, 375, 750, 375],
    //       adjacency: [null, [0, 1], null, [1, 1]]
    //     })
    //   ]
    // });
  });
  test("Should NOT add transit barcode at boundary ", async () => {
    const initialState = makeState(singleFloorVanilla, 1);
    const store = mockStore(initialState);
    await store.dispatch(
      addTransitBarcode({
        tileId: "0,0",
        direction: 1,
        newBarcode: "003.003",
        distance: 750
      })
    );
    const dispatchedActions = store.getActions();
    expect(dispatchedActions[0]).toMatchObject({
      type: "SET-ERROR-MESSAGE",
      value: "Cannot Add transit barcode in direction: 1 of coordinate: 0,0"
    });
  });
  test("Should throw error when distance provided in form makes size_info negative for a neighbour barcode", async () => {
    const initialState = makeState(singleFloorVanilla, 1);
    const store = mockStore(initialState);
    store.dispatch(
      addTransitBarcode({
        tileId: "1,1",
        direction: 1,
        newBarcode: "003.003",
        sector: 0,
        distance: 1500
      })
    );
    const dispatchedActions = store.getActions();
    expect(dispatchedActions[0]).toMatchObject({
      type: "SET-ERROR-MESSAGE",
      value:
        "Transit barcode will overlap with existing barcode in direction: 1"
    });
  });
  test("Should throw error when barcode provided in form already exists in maps", async () => {
    const initialState = makeState(singleFloorVanilla, 1);
    const store = mockStore(initialState);
    store.dispatch(
      addTransitBarcode({
        tileId: "1,1",
        direction: 1,
        newBarcode: "002.002",
        distance: 750
      })
    );
    const dispatchedActions = store.getActions();
    expect(dispatchedActions[0]).toMatchObject({
      type: "SET-ERROR-MESSAGE",
      value: "Barcode:  002.002 already exists in map"
    });
  });
});

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

describe("locateBarcode", () => {
  const { locateBarcode } = barcode;
  test("should set error message if barcode doesn't exist", async () => {
    // 3x3 vanilla map going from 0,0 to 2,2
    const initialState = makeState(singleFloorVanilla, 1);
    const store = mockStore(initialState);
    await store.dispatch(locateBarcode("003.003"));
    const dispatchedActions = store.getActions();
    expect(dispatchedActions).toHaveLength(1);
    expect(dispatchedActions[0].type).toEqual("SET-ERROR-MESSAGE");
    expect(dispatchedActions[0].value).toMatch(/Barcode 003.003 not found./);
  });
  test("should not dispatch any action if barcode exists", async () => {
    // no actions dispatched since only the side effect of viewport was done
    // TODO: how to test then?
    // 3x3 vanilla map going from 0,0 to 2,2
    const initialState = makeState(singleFloorVanilla, 1);
    const store = mockStore(initialState);
    await store.dispatch(locateBarcode("002.002"));
    const dispatchedActions = store.getActions();
    expect(dispatchedActions).toHaveLength(0);
  });
  test("should dispatch change floor action if barcode not on current floor", async () => {
    // currently on 2nd floor (with some irrelevant barcodes)
    // trying to locate 2,2 which is on first floor
    const initialState = makeState(twoFloors, 2);
    // need to use real store since we are using the new state
    // after dispatching the 'CHANGE-FLOOR' action in our logic
    // if we use mockStore, the store's state won't change after
    // dispatching the 'CHANGE-FLOOR' action
    var store = configureRealStore(initialState);
    await store.dispatch(locateBarcode("002.002"));
    // since not using mock store, can't see 'dispatchedActions'
    // instead just look at state to ensure floor was changed.
    var newState = store.getState();
    expect(newState.currentFloor).toEqual(1);
  });
});
