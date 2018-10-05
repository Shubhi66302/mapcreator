import { TILE_WIDTH, TILE_HEIGHT } from "../constants";
import { normalizeMap } from "utils/normalizr";
import { combineReducers } from "redux";
import { createEntityReducer } from "./util";
import reduceReducers from "reduce-reducers";
import floorReducer from "./floor";
import barcodeReducer from "./barcode";
import { getDragSelectedTiles } from "utils/selectors";
import _ from "lodash";

export const dummyState = {
  normalizedMap: normalizeMap({
    id: "1",
    name: "loading...",
    map: {
      id: "1",
      floors: [
        {
          floor_id: 1,
          map_values: []
        }
      ],
      elevators: [],
      zones: [],
      queueDatas: []
    }
  }),
  currentFloor: 1,
  selection: {
    mapTiles: {},
    distanceTIles: {}
  },
  zoneView: false,
  selectedArea: null,
  metaKey: false,
  viewport: {
    viewportInstance: null,
    minimapInstance: null,
    currentView: null
  }
};

// exporting reducers for testing
export var baseBarcodeReducer = createEntityReducer("BARCODE", "coordinate");

export const entitiesReducer = combineReducers({
  elevator: createEntityReducer("ELEVATOR", "elevator_id"),
  queueData: createEntityReducer("QUEUE-DATA", "queue_data_id"),
  charger: createEntityReducer("CHARGER", "charger_id"),
  pps: createEntityReducer("PPS", "pps_id"),
  ods: createEntityReducer("ODS", "ods_id"),
  dockPoint: createEntityReducer("DOCK-POINT", "dock_point_id"),
  fireEmergency: createEntityReducer("FIRE-EMERGENCY", "fire_emergency_id"),
  barcode: reduceReducers(barcodeReducer, baseBarcodeReducer),
  floor: floorReducer,
  // TODO: make reducers for these
  // using identity reducers for rest for now?
  map: m => m || null,
  mapObj: m => m || null
});

export const mapUpdateReducer = combineReducers({
  entities: entitiesReducer,
  result: r => r || null
});

// for full map updates eg. clear, new
export const mapChangeReducer = (state = dummyState.normalizedMap, action) => {
  switch (action.type) {
    case "CLEAR-MAP":
      return dummyState.normalizedMap;
    case "NEW-MAP":
      return normalizeMap(action.value);
  }
  return state;
};

export const mapReducer = reduceReducers(mapUpdateReducer, mapChangeReducer);

export const currentFloorReducer = (state = 1, action) => {
  switch (action.type) {
    case "CLEAR-MAP":
    case "NEW-MAP":
      return 1;
    case "CHANGE-FLOOR":
      return action.value;
  }
  return state;
};

// helper exported for testing
export const toggleKeyInMap = (theMap, key) => {
  if (theMap[key]) {
    const { [`${key}`]: toDelete_, ...rest } = theMap;
    return { ...rest };
  }
  return { ...theMap, [key]: true };
};

export const selectedDistanceTilesReducer = (state = {}, action) => {
  switch (action.type) {
    case "CLEAR-MAP":
    case "NEW-MAP":
    case "CLEAR-SELECTED-TILES":
    case "CLICK-OUTSIDE-TILES":
    // should deselect if a map tile is clicked
    case "CLICK-ON-MAP-TILE":
      return {};
    case "CLICK-ON-DISTANCE-TILE":
      return toggleKeyInMap(state, action.value);
  }
  return state;
};

export const selectedMapTilesReducer = (state = {}, action) => {
  switch (action.type) {
    case "CLEAR-MAP":
    case "NEW-MAP":
    case "CLEAR-SELECTED-TILES":
    case "CLICK-OUTSIDE-TILES":
    // should deselect if a distance tile is selected
    case "CLICK-ON-DISTANCE-TILE":
      return {};
    case "CLICK-ON-MAP-TILE":
      return toggleKeyInMap(state, action.value);
  }
  return state;
};

export const baseSelectionReducer = combineReducers({
  mapTiles: selectedMapTilesReducer,
  distanceTiles: selectedDistanceTilesReducer
});

// exported for testing
export const xoredMap = (theMap, keysArr) => {
  // keysArr should be array of strings!
  const xored = _.xor(Object.keys(theMap), keysArr.map(x => `${x}`));
  return _.fromPairs(xored.map(x => [x, true]));
};

export const selectionReducer = (
  state = { mapTiles: {}, distanceTiles: {} },
  action
) => {
  switch (action.type) {
    case "DRAG-END":
      const { mapTilesArr = [], distanceTilesArr = [] } = action.value;
      // if both map tiles and distance tiles are selected, consider only map tiles as selected
      if (mapTilesArr.length > 0) {
        return {
          distanceTiles: {},
          mapTiles: xoredMap(state.mapTiles, mapTilesArr)
        };
      }
      return {
        mapTiles: {},
        distanceTiles: xoredMap(state.distanceTiles, distanceTilesArr)
      };
  }
  return state;
};

export const spritesheetLoadedReducer = (state = false, action) => {
  switch (action.type) {
    case "LOADED-SPRITESHEET":
      return true;
  }
  return state;
};

export const metaKeyReducer = (state = false, action) => {
  switch (action.type) {
    case "META-KEY-DOWN":
      return true;
    case "META-KEY-UP":
      return false;
  }
  return state;
};

export const selectedAreaReducer = (state = null, action) => {
  switch (action.type) {
    case "DRAG-START": {
      if (state) {
        // duplicate event, already processing a drag
        return state;
      }
      let { x, y } = action.value;
      return { startPoint: { x, y }, endPoint: { x, y } };
    }
    case "DRAG-MOVE": {
      if (!state) {
        // drag not started yet?
        return state;
      }
      let { x, y } = action.value;
      return { ...state, endPoint: { x, y } };
    }
    case "DRAG-END":
      return null;
  }
  return state;
};

const viewportReducer = (
  state = { viewportInstance: null, minimapInstance: null, currentView: null },
  action
) => {
  switch (action.type) {
    case "REGISTER-PIXI-VIEWPORT":
      return { ...state, viewportInstance: action.value };
    case "REGISTER-PIXI-MINIMAP":
      return { ...state, minimapInstance: action.value };
  }
  return state;
};

export default combineReducers({
  normalizedMap: mapReducer,
  currentFloor: currentFloorReducer,
  selection: reduceReducers(selectionReducer, baseSelectionReducer),
  zoneView: z => z || false,
  spritesheetLoaded: spritesheetLoadedReducer,
  metaKey: metaKeyReducer,
  selectedArea: selectedAreaReducer,
  viewport: viewportReducer
});
