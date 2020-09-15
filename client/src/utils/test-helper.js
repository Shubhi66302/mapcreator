import { normalizeMap, denormalizeMap } from "./normalizr";
import sampleMapObj from "test-data/test-maps/3x3-with-pps-charger-fireemergencies.json";
import sampleMapObj1 from "test-data/test-maps/map_with_pps.json";
import sampleVanillaMapObj from "test-data/test-maps/3x3-vanilla.json";
import simpleVanillaWithChargerObj from "test-data/test-maps/3x3-with-charger.json";

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
  },
  successMessage: null,
  errorMessage: null
});

export var singleFloorVanilla = fromJS(sampleVanillaMapObj);
export var singleFloor = fromJS(sampleMapObj);
export var singleFloorPps = fromJS(sampleMapObj1);

export var singleFloorVanillaCharger = fromJS(simpleVanillaWithChargerObj);
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
          neighbours: [[1, 1, 1], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
          adjacency: [[11, 17], null, null, null],
          size_info: [750, 750, 750, 750],
          botid: "null"
        },
        {
          blocked: false,
          zone: "defzone",
          coordinate: "11,17",
          store_status: 0,
          barcode: "017.013",
          neighbours: [[0, 0, 0], [0, 0, 0], [1, 1, 1], [0, 0, 0]],
          adjacency: [null, null, [15, 12], null],
          size_info: [750, 750, 750, 750],
          botid: "null"
        }
      ]
    }
  ])
);

// Map with one transit barcode
// 2,0        1,0    1,3     0,0
// 2,1        1,1            0,1
// 2,2        1,2            0,2

export var singleFloorVanillaWithOneTransitBarcode = (() => {
  var normalizedMap = normalizeMap(singleFloorVanilla.toJS());
  normalizedMap.entities.barcode["1,3"] = {
    store_status: 0,
    zone: "defzone",
    barcode: "003.001",
    botid: "null",
    neighbours: [[0, 0, 0], [1, 1, 1], [0, 0, 0], [1, 1, 1]],
    coordinate: "1,3",
    blocked: false,
    size_info: [750, 375, 750, 375],
    adjacency: [null, [0, 0], null, [1, 0]]
  };
  // Modify adjacency and size info of neighbours of transit barcode
  normalizedMap.entities.barcode["0,0"].size_info = [750, 750, 750, 375];
  normalizedMap.entities.barcode["0,0"].adjacency = [
    null,
    null,
    [0, 1],
    [1, 3]
  ];
  normalizedMap.entities.barcode["1,0"].size_info = [750, 375, 750, 750];
  normalizedMap.entities.barcode["1,0"].adjacency = [
    null,
    [1, 3],
    [1, 1],
    [2, 0]
  ];
  normalizedMap.entities.floor["1"].map_values = [
    ...normalizedMap.entities.floor["1"].map_values,
    "1,3"
  ];
  return fromJS(denormalizeMap(normalizedMap));
})();

// Map with two transit barcodes
// 2,0        1,0    1,3    0,0
// 2,1        1,1           0,1
// 2,2        1,2    1,4    0,2
export var singleFloorVanillaWithTwoTransitBarcodes = (() => {
  var normalizedMap = normalizeMap(
    singleFloorVanillaWithOneTransitBarcode.toJS()
  );
  normalizedMap.entities.barcode["1,4"] = {
    store_status: 0,
    zone: "defzone",
    barcode: "004.001",
    botid: "null",
    neighbours: [[0, 0, 0], [1, 1, 1], [0, 0, 0], [1, 1, 1]],
    coordinate: "1,4",
    blocked: false,
    size_info: [750, 375, 750, 375],
    adjacency: [null, [0, 2], null, [1, 2]]
  };
  // Modify adjacency and size info of neighbours of transit barcode
  normalizedMap.entities.barcode["0,2"].size_info = [750, 750, 750, 375];
  normalizedMap.entities.barcode["0,2"].adjacency = [
    null,
    null,
    [0, 1],
    [1, 4]
  ];
  normalizedMap.entities.barcode["1,2"].size_info = [750, 375, 750, 750];
  normalizedMap.entities.barcode["1,2"].adjacency = [
    null,
    [1, 4],
    [1, 1],
    [2, 0]
  ];
  normalizedMap.entities.floor["1"].map_values = [
    ...normalizedMap.entities.floor["1"].map_values,
    "1,4"
  ];
  return fromJS(denormalizeMap(normalizedMap));
})();

export const addQueueSelectedTilesToState = (store, tilesList) => {
  // set queue mode to true
  store.dispatch({ type: "TOGGLE-QUEUE-MODE" });
  // add each queue tile one after the other
  tilesList.forEach(tile => store.dispatch(mapTileClick(tile)));
  return store;
};

// Map with one transit barcode
// 2,0        1,0       0,0
// 2,1        1,1       0,1
// 2,2        1,2       0,2
export var singleFloorVanillaDisAllowBotMovement = (() => {
  var normalizedMap = normalizeMap(singleFloorVanilla.toJS());
  // Modify adjacency and size info of neighbours of transit barcode
  normalizedMap.entities.barcode["0,2"].neighbours = [[1,0,0],[0,0,0],[0,0,0],[1,1,1]];
  normalizedMap.entities.barcode["0,1"].neighbours = [[1,1,1],[0,0,0],[1,0,0],[1,1,1]];
  return fromJS(denormalizeMap(normalizedMap));
})();
