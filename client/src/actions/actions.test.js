import { tileToWorldCoordinate } from "utils/util";
import thunk from "redux-thunk";
import { tileBoundsSelector } from "utils/selectors";
import configureStore from "redux-mock-store";
import { makeState, singleFloor, singleFloorVanilla } from "utils/test-helper";
import * as actions from "./actions";
import fetchMock from "fetch-mock";

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// TODO: test click-between-tiles functionality more thoroughly
describe("clickOnViewport", () => {
  const { clickOnViewport, mapTileClick, outsideTilesClick } = actions;
  test("dispatches click on tile action when an existing tile is clicked", async () => {
    // setup
    const initialState = makeState(singleFloor, 1);
    const store = mockStore(initialState);
    const tileBounds = tileBoundsSelector(initialState);
    var clickPoint = tileToWorldCoordinate("1,0", tileBounds);

    await store.dispatch(clickOnViewport(clickPoint));
    const dispatchedActions = store.getActions();

    // test
    expect(dispatchedActions).toEqual([mapTileClick("1,0")]);
  });
  test("dispatches outside click action when clicking on a non existing tile (i.e. outside map)", async () => {
    // setup
    const initialState = makeState(singleFloor, 1);
    const store = mockStore(initialState);
    const tileBounds = tileBoundsSelector(initialState);
    var clickPoint = tileToWorldCoordinate("100,100", tileBounds);

    await store.dispatch(clickOnViewport(clickPoint));
    const dispatchedActions = store.getActions();

    // test
    expect(dispatchedActions).toEqual([outsideTilesClick]);
  });
});

describe("fetchMap", () => {
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });
  const { fetchMap, newMap, clearMap } = actions;

  test("should dispatch NEW-MAP when fetching an existing map", async () => {
    // setup
    const initialState = makeState(singleFloor, 1);
    const store = mockStore(initialState);
    const dummyMap = { map: "dummy", name: "dummy" };
    fetchMock.getOnce("/api/map/1", {
      body: dummyMap,
      headers: {
        "content-type": "application/json"
      }
    });

    await store.dispatch(fetchMap(1));
    const dispatchedActions = store.getActions();

    // test
    expect(dispatchedActions).toEqual([clearMap, newMap(dummyMap)]);
  });

  test("should not dispatch NEW-MAP when fetching a non existing map", async () => {
    // setup
    const initialState = makeState(singleFloor, 1);
    const store = mockStore(initialState);
    fetchMock.getOnce("/api/map/1", { status: 500, body: "error" });

    await store.dispatch(fetchMap(1));
    const dispatchedActions = store.getActions();

    // test
    expect(dispatchedActions).toEqual([clearMap]);
  });
});

describe("addEntitiesToFloor", () => {
  const { addEntitiesToFloor } = actions;
  test("should have a list of ids for a list of entities", () => {
    expect(
      addEntitiesToFloor({
        currentFloor: 1,
        floorKey: "ppses",
        entities: [
          { pps_id: 1, something: "else" },
          { pps_id: 3, something: "else2" }
        ],
        idField: "pps_id"
      })
    ).toEqual({
      type: "ADD-ENTITIES-TO-FLOOR",
      value: {
        currentFloor: 1,
        floorKey: "ppses",
        ids: [1, 3]
      }
    });
  });
});

describe("toggleStorable", () => {
  const { toggleStorable, clearTiles } = actions;
  test("should dispatch assign storable action and also clear tiles action", async () => {
    // setup
    const selectedMapTiles =  {"1,1": true, "1,2": true};
    var initialState = makeState(singleFloorVanilla, 1, selectedMapTiles);
    const store = mockStore(initialState);

    await store.dispatch(toggleStorable());
    var dispatchedActions = store.getActions();

    // test
    expect(dispatchedActions).toEqual([
      {
        type: "TOGGLE-STORABLE",
        value: {selectedTiles: ["1,1", "1,2"], makeStorable: 1}
      },
      clearTiles
    ]);
  });

  test ("should dispatch assign storable action when mixed type of coordinates selected", async () => {
    // setup
    const selectedMapTiles =  {"1,0": true, "1,2": true};
    var initialState = makeState(singleFloorVanilla, 1, selectedMapTiles);
    initialState.normalizedMap.entities.barcode["1,2"].store_status = 1;
    const store = mockStore(initialState);

    await store.dispatch(toggleStorable());
    var dispatchedActions = store.getActions();

    // test
    expect(dispatchedActions).toEqual([
      {
        type: "TOGGLE-STORABLE",
        value: {selectedTiles: ["1,0", "1,2"], makeStorable: 1}
      },
      clearTiles
    ]);
  });

  test ("should dispatch non-storable action when all storables are selected", async () => {
    // setup
    const selectedMapTiles =  {"1,0": true, "1,2": true};
    var initialState = makeState(singleFloorVanilla, 1, selectedMapTiles);
    initialState.normalizedMap.entities.barcode["1,2"].store_status = 1;
    initialState.normalizedMap.entities.barcode["1,0"].store_status = 1;
    const store = mockStore(initialState);

    await store.dispatch(toggleStorable());
    var dispatchedActions = store.getActions();

    // test
    expect(dispatchedActions).toEqual([
      {
        type: "TOGGLE-STORABLE",
        value: {selectedTiles: ["1,0", "1,2"], makeStorable: 0}
      },
      clearTiles
    ]);
  });

});

// TODO: test for saveMap

describe("addQueueBarcodes", () => {
  const { addQueueBarcodes, clearTiles } = actions;
  test("should make queue barcodes with both barcodes and coordinates in values", async () => {
    var selectedMapTiles = { "2,2": 1, "1,2": 2, "1,1": 3 };
    var initialState = makeState(singleFloor, 1, selectedMapTiles);
    const store = mockStore(initialState);

    await store.dispatch(addQueueBarcodes());
    const dispatchedActions = store.getActions();

    // test
    expect(dispatchedActions).toEqual([
      {
        type: "ADD-QUEUE-BARCODES-TO-PPS",
        value: {
          tiles: ["002.002", "002.001", "001.001"],
          pps_id: "2",
          coordinates: ["2,2", "1,2", "1,1"],
          pps_coordinate: "1,1"
        }
      },
      clearTiles
    ]);
  });
});

describe("editSpecialBarcode", () => {
  const { editSpecialBarcode } = actions;
  test("should dispatch edit barcode action if new_barcode's coordinate doesn't already exist", async () => {
    var initialState = makeState(singleFloor, 1);
    const store = mockStore(initialState);

    await store.dispatch(
      editSpecialBarcode({ coordinate: "12,12", new_barcode: "500.500" })
    );
    const dispatchedActions = store.getActions();

    expect(dispatchedActions).toEqual([
      {
        type: "EDIT-BARCODE",
        value: { coordinate: "12,12", new_barcode: "500.500" }
      }
    ]);
  });
  test("should not dispatch edit barcode action if new_barcode's coordinate already exists", async () => {
    var initialState = makeState(singleFloor, 1);
    const store = mockStore(initialState);

    await store.dispatch(
      editSpecialBarcode({ coordinate: "12,12", new_barcode: "001.001" })
    );
    const dispatchedActions = store.getActions();

    expect(dispatchedActions).toEqual([]);
  });
});
