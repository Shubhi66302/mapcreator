import { tileToWorldCoordinate } from "utils/util";
import thunk from "redux-thunk";
import { tileBoundsSelector } from "utils/selectors";
import configureStore from "redux-mock-store";
import { makeState, singleFloor } from "utils/test-helper";
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

describe("assignStorable", () => {
  const { assignStorable, clearTiles } = actions;
  test("should dispatch assign storable action and also clear tiles action", async () => {
    // setup
    const selectedMapTiles = { "1,1": true, "1,2": true };
    const initialState = makeState(singleFloor, 1, selectedMapTiles);
    const store = mockStore(initialState);

    await store.dispatch(assignStorable());
    const dispatchedActions = store.getActions();

    // test
    expect(dispatchedActions).toEqual([
      {
        type: "ASSIGN-STORABLE",
        value: selectedMapTiles
      },
      clearTiles
    ]);
  });
});

// TODO: test for saveMap
