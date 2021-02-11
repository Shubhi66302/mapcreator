import { tileToWorldCoordinate} from "utils/selectors";
import thunk from "redux-thunk";
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
    const state = makeState(singleFloor, 1);
    const store = mockStore(state);
    var clickPoint = tileToWorldCoordinate(state, {"tileId": "1,0"});
    await store.dispatch(clickOnViewport(clickPoint));
    const dispatchedActions = store.getActions();

    // test
    expect(dispatchedActions).toEqual([mapTileClick("1,0")]);
  });
  test("dispatches outside click action when clicking on a non existing tile (i.e. outside map)", async () => {
    // setup
    const state = makeState(singleFloor, 1);
    const store = mockStore(state);
    var clickPoint = {x: 40000, y: 50000};
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

describe("removeEntitiesToFloor", () => {
  const { removeEntitiesToFloor } = actions;
  test("should have a list of ids for a list of entities", () => {
    expect(
      removeEntitiesToFloor({
        currentFloor: 1,
        floorKey: "ppses",
        ids: [1,2]
      })
    ).toEqual({
      type: "REMOVE-ENTITIES-FROM-FLOOR",
      value: {
        currentFloor: 1,
        floorKey: "ppses",
        ids: [1,2]
      }
    });
  });
});

describe("toggleStorable", () => {
  const { toggleStorable, clearTiles } = actions;
  test("should dispatch assign storable action and also clear tiles action", async () => {
    // setup
    const selectedMapTiles = { "1,1": true, "1,2": true };
    var initialState = makeState(singleFloorVanilla, 1, selectedMapTiles);
    const store = mockStore(initialState);

    await store.dispatch(toggleStorable());
    var dispatchedActions = store.getActions();

    // test
    expect(dispatchedActions).toEqual([
      {
        type: "TOGGLE-STORABLE",
        value: { selectedTiles: ["1,1", "1,2"], makeStorable: 1 }
      },
      clearTiles
    ]);
  });

  test("should dispatch assign storable action when mixed type of coordinates selected", async () => {
    // setup
    const selectedMapTiles = { "1,0": true, "1,2": true };
    var initialState = makeState(singleFloorVanilla, 1, selectedMapTiles);
    initialState.normalizedMap.entities.barcode["1,2"].store_status = 1;
    const store = mockStore(initialState);

    await store.dispatch(toggleStorable());
    var dispatchedActions = store.getActions();

    // test
    expect(dispatchedActions).toEqual([
      {
        type: "TOGGLE-STORABLE",
        value: { selectedTiles: ["1,0", "1,2"], makeStorable: 1 }
      },
      clearTiles
    ]);
  });

  test("should dispatch non-storable action when all storables are selected", async () => {
    // setup
    const selectedMapTiles = { "1,0": true, "1,2": true };
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
        value: { selectedTiles: ["1,0", "1,2"], makeStorable: 0 }
      },
      clearTiles
    ]);
  });
});

// TODO: test for saveMap

describe("addPPSQueue", () => {
  const { addPPSQueue } = actions;
  test("should make queue barcodes with both barcodes and coordinates in values", async () => {
    var selectedMapTiles = { "2,2": 1, "1,2": 2, "1,1": 3 };
    var initialState = makeState(singleFloor, 1, selectedMapTiles);
    const store = mockStore(initialState);

    await store.dispatch(addPPSQueue());
    const dispatchedActions = store.getActions();

    // test
    expect(dispatchedActions).toEqual([
      {
        type: "ADD-QUEUE-BARCODES-TO-PPS",
        value: {
          tiles: ["002.002", "002.001", "001.001"],
          pps_id: "2",
          coordinates: ["2,2", "1,2", "1,1"],
          multi_queue_mode: false,
          pps_coordinate: "1,1",
          current_queue_barcodes : [],
          current_queue_coordinates : []
        }
      }
    ]);
  });
});

describe("addHighwayQueue", () => {
  const { addHighwayQueue } = actions;
  test("should make list of coordinates in actoin value", async () => {
    var selectedMapTiles = { "2,2": 1, "1,2": 2, "1,1": 3 };
    var initialState = makeState(singleFloor, 1, selectedMapTiles);
    const store = mockStore(initialState);

    await store.dispatch(addHighwayQueue());
    const dispatchedActions = store.getActions();

    // test
    expect(dispatchedActions).toEqual([
      {
        type: "ADD-QUEUE-BARCODES-TO-HIGHWAY",
        value: {
          coordinates: ["2,2", "1,2", "1,1"],
        }
      }
    ]);
  });
});

describe("deleteMap", () => {
  const { deleteMap } = actions;
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });
  test("should redirect to home when map is successfully deleted", async () => {
    // setup
    const initialState = makeState(singleFloor, 1);
    const store = mockStore(initialState);
    fetchMock.postOnce("/api/deleteMap/31", 200);
    const historyPushMock = jest.fn();

    await store.dispatch(deleteMap(31, { push: historyPushMock }));
    const dispatchedActions = store.getActions();

    // test
    // post request was made to backend to delete map
    expect(fetchMock.called("/api/deleteMap/31"));
    // doesn't dispatch any actions since we will redirect to home page
    expect(dispatchedActions).toEqual([]);
    // history.push is called once with path "/"
    expect(historyPushMock.mock.calls.length).toBe(1);
    expect(historyPushMock.mock.calls[0][0]).toBe("/");
  });
  test("should dispatch error message if delete failed and not redirect to home", async () => {
    // setup
    const initialState = makeState(singleFloor, 1);
    const store = mockStore(initialState);
    // error response in post
    fetchMock.postOnce("/api/deleteMap/31", 500);
    const historyPushMock = jest.fn();

    await store.dispatch(deleteMap(31, { push: historyPushMock }));
    const dispatchedActions = store.getActions();

    // test
    // post request was made to backend to delete map
    expect(fetchMock.called("/api/deleteMap/31"));
    // dispatched setErrorMessage since post req returned error
    expect(dispatchedActions).toHaveLength(1);
    expect(dispatchedActions[0]).toMatchObject({
      type: "SET-ERROR-MESSAGE"
    });
    // history.push should not have been called
    expect(historyPushMock.mock.calls.length).toBe(0);
  });
});
