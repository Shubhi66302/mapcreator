import { TILE_WIDTH, TILE_HEIGHT } from "../constants";
import { normalizeMap } from "utils/normalizr";
import { combineReducers } from "redux";
import { createEntityReducer } from "./util";
import reduceReducers from "reduce-reducers";
import floorReducer from "./floor";
import barcodeReducer from "./barcode";
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
  selectedTiles: {},
  selectedDistanceTiles: {},
  zoneView: false,
  selectedArea: null,
  metaKey: false,
  viewport: {
    instance: null,
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

export const selectedDistanceTilesReducer = (state = {}, action) => {
  switch (action.type) {
    case "CLICK-ON-DISTANCE-TILE":
  }
};

export const selectedTilesReducer = (state = {}, action) => {
  switch (action.type) {
    case "CLEAR-MAP":
    case "NEW-MAP":
    case "CLEAR-SELECTED-TILES":
    case "CLICK-OUTSIDE-TILES":
      return {};

    case "CLICK-ON-TILE":
      const tileId = action.value;
      if (state[tileId]) {
        // delete tile from selected
        const { [tileId]: toDelete_, ...rest } = state;
        return { ...rest };
      } else {
        // using true to signify tile is selected. doesn't really matter what
        // the value is, just interested in the key
        return { ...state, [tileId]: true };
      }
    case "DRAG-END":
      const selectedTiles = action.value;
      if (selectedTiles) {
        // calculate symmetric difference
        const xored = _.xor(Object.keys(state), selectedTiles);
        return _.fromPairs(xored.map(x => [x, true]));
      }
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
  state = { instance: null, currentView: null },
  action
) => {
  switch (action.type) {
    case "REGISTER-PIXI-VIEWPORT":
      return { ...state, instance: action.value };
  }
  return state;
};

export default combineReducers({
  normalizedMap: mapReducer,
  currentFloor: currentFloorReducer,
  selectedTiles: selectedTilesReducer,
  zoneView: z => z || false,
  spritesheetLoaded: spritesheetLoadedReducer,
  metaKey: metaKeyReducer,
  selectedArea: selectedAreaReducer,
  viewport: viewportReducer
});
