import { normalizeMap } from "./normalizr";
import sampleMapObj from "test-data/test-maps/3x3-with-pps-charger-fireemergencies.json";
import sampleVanillaMapObj from "test-data/test-maps/3x3-vanilla.json";
// using immutable to correctly mutate mapJson for testing
// we're not actually using immutable in state/main code, it's quite complicated to use
// https://redux.js.org/recipes/usingimmutablejs#what-are-the-issues-with-using-immutable-js
import { fromJS } from "immutable";
import { dummyState } from "reducers/util";
import { mapTileClick } from "actions/actions";

export var makeState = (
  immutableMap,
  currentFloor = 1,
  selectedMapTiles = {},
  selectedDistanceTiles = {}
) => ({
  ...dummyState,
  normalizedMap: normalizeMap(immutableMap.toJS()),
  currentFloor,
  selection: {
    ...dummyState.selection,
    metaKey: false,
    shiftKey: false,
    mapTiles: selectedMapTiles,
    distanceTiles: selectedDistanceTiles
  }
});

export var singleFloor = fromJS(sampleMapObj);
export var twoFloors = singleFloor.updateIn(["map", "floors"], floors =>
  fromJS([
    ...floors,
    {
      floor_id: 2,
      map_values: [
        {
          blocked: false,
          zone: "defzone",
          coordinate: "15,12",
          store_status: 0,
          barcode: "012.015",
          neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
          size_info: [750, 750, 750, 750],
          botid: "null"
        },
        {
          blocked: false,
          zone: "defzone",
          coordinate: "11,17",
          store_status: 0,
          barcode: "017.013",
          neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
          size_info: [750, 750, 750, 750],
          botid: "null"
        }
      ]
    }
  ])
);
export var singleFloorVanilla = fromJS(sampleVanillaMapObj);
export const addQueueSelectedTilesToState = (store, tilesList) => {
  // set queue mode to true
  store.dispatch({ type: "TOGGLE-QUEUE-MODE" });
  // add each queue tile one after the other
  tilesList.forEach(tile => store.dispatch(mapTileClick(tile)));
  return store;
};
