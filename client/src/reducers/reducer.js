import { normalizeMap } from "utils/normalizr";
import { combineReducers } from "redux";
import { createEntityReducer, dummyState } from "./util";
import reduceReducers from "reduce-reducers";
import floorReducer from "./floor";
import barcodeReducer from "./barcode";
import currentFloorReducer from "./currentFloor";
import mapReducer from "./map";
import elevatorReducer from "./elevator";
import zoneReducer from "./zone";
import charger from "./charger";
import _ from "lodash";

// exporting reducers for testing
export var baseBarcodeReducer = createEntityReducer("BARCODE", "coordinate");
export var basePPSReducer = createEntityReducer("PPS", "pps_id");
export var baseElevatorReducer = createEntityReducer("ELEVATOR", "elevator_id");
export var baseChargerReducer = createEntityReducer("CHARGER", "charger_id");

export var ppsReducer = (state = {}, action) => {
  switch (action.type) {
    case "ADD-QUEUE-BARCODES-TO-PPS":
      return {
        ...state,
        [action.value.pps_id]: {
          ...state[action.value.pps_id],
          queue_barcodes: action.value.tiles
        }
      };
  }
  return { ...state };
};

export const entitiesReducer = combineReducers({
  elevator: reduceReducers(elevatorReducer, baseElevatorReducer),
  queueData: createEntityReducer("QUEUE-DATA", "queue_data_id"),
  charger: reduceReducers(charger, baseChargerReducer),
  pps: reduceReducers(basePPSReducer, ppsReducer),
  ods: createEntityReducer("ODS", "ods_id"),
  dockPoint: createEntityReducer("DOCK-POINT", "dock_point_id"),
  fireEmergency: createEntityReducer("FIRE-EMERGENCY", "fire_emergency_id"),
  barcode: reduceReducers(barcodeReducer, baseBarcodeReducer),
  floor: floorReducer,
  map: mapReducer,
  zone: zoneReducer,
  // TODO: make reducers for these
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

export const normalizedMapReducer = reduceReducers(
  mapUpdateReducer,
  mapChangeReducer
);

// helper exported for testing
export const toggleKeyInMap = (theMap, key) => {
  if (theMap[key]) {
    return _.omit(theMap, key);
  }

  return { ...theMap, [key]: true };
};

export const toggleKeyInMapWhenQueueMode = (state, tileId) => {
  var a = _.reduce(
    state,
    function(acc, value) {
      return Math.max(acc, value);
    },
    0
  );

  return { ...state, [tileId]: a + 1 };
};

export const selectedDistanceTilesReducer = (state = {}, action) => {
  switch (action.type) {
    case "CLEAR-MAP":
    case "NEW-MAP":
    case "CLEAR-SELECTED-TILES":
    case "CLICK-OUTSIDE-TILES":
    // should deselect if a map tile is clicked
    case "CLICK-ON-MAP-TILE":
    case "CHANGE-FLOOR":
    case "ADD-ELEVATOR":
      return {};
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
    case "CHANGE-FLOOR":
    case "ADD-ELEVATOR":
      return {};
  }
  return state;
};
const QueueModeReducer = (state = false, action) => {
  switch (action.type) {
    case "TOGGLE-QUEUE-MODE":
      return !state;
  }
  return state;
};
export const baseSelectionReducer = combineReducers({
  mapTiles: selectedMapTilesReducer,
  distanceTiles: selectedDistanceTilesReducer,
  queueMode: QueueModeReducer,
  metaKey: (e = false) => e,
  shiftKey: (e = false) => e
});

// exported for testing
export const xoredMap = (theMap, keysArr) => {
  // keysArr should be array of strings!
  const xored = _.xor(Object.keys(theMap), keysArr.map(x => `${x}`));
  return _.fromPairs(xored.map(x => [x, true]));
};

export const selectionReducer = (
  state = {
    mapTiles: {},
    distanceTiles: {},
    metaKey: false,
    shiftKey: false,
    queueMode: false
  },
  action
) => {
  switch (action.type) {
    case "META-KEY-UP":
      return { ...state, metaKey: false };
    case "META-KEY-DOWN":
      return { ...state, metaKey: true };
    case "SHIFT-KEY-UP":
      return { ...state, shiftKey: false };
    case "SHIFT-KEY-DOWN":
      return { ...state, shiftKey: true };
    case "TOGGLE-QUEUE-MODE":
      return { mapTiles: {}, distanceTiles: {}, queueMode: state.queueMode };
    case "CLICK-ON-MAP-TILE":
      var tileId = action.value;
      if (!state.queueMode) {
        if (state.mapTiles[tileId]) {
          // delete tile from selected
          return { ...state, mapTiles: _.omit(state.mapTiles, tileId) };
        } else {
          // using true to signify tile is selected. doesn't really matter what
          // the value is, just interested in the key
          return { ...state, mapTiles: { ...state.mapTiles, [tileId]: true } };
        }
      } else {
        // don't do anything if it's already selected
        if (state.mapTiles[action.value]) {
          return state;
        }
        var a = _.reduce(
          state.mapTiles,
          function(acc, value) {
            return Math.max(acc, value);
          },
          0
        );

        return { ...state, mapTiles: { ...state.mapTiles, [tileId]: a + 1 } };
      }

    case "CLICK-ON-DISTANCE-TILE":
      if (state.queueMode) {
        return { ...state, queueMode: state.queueMode };
      } else {
        return {
          ...state,
          distanceTiles: toggleKeyInMap(state.distanceTiles, action.value)
        };
      }

    case "ADD-QUEUE-BARCODES-TO-PPS":
      if (!state.queueMode) {
        return { ...state };
      } else {
        var newState = {};

        return Object.assign({}, state, newState);
      }
    case "DRAG-END": {
      const { mapTilesArr = [], distanceTilesArr = [] } = action.value;
      // if both map tiles and distance tiles are selected, consider only map tiles as selected
      if (!state.queueMode) {
        if (mapTilesArr.length > 0) {
          return {
            ...state,
            distanceTiles: {},
            mapTiles: xoredMap(state.mapTiles, mapTilesArr)
          };
        }
        return {
          ...state,
          mapTiles: {},
          distanceTiles: xoredMap(state.distanceTiles, distanceTilesArr)
        };
      } else {
        return { ...state };
      }
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

export const shiftKeyReducer = (state = false, action) => {
  switch (action.type) {
    case "SHIFT-KEY-DOWN":
      return true;
    case "SHIFT-KEY-UP":
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
  normalizedMap: normalizedMapReducer,
  currentFloor: currentFloorReducer,
  selection: reduceReducers(selectionReducer, baseSelectionReducer),
  zoneView: z => z || false,
  spritesheetLoaded: spritesheetLoadedReducer,
  selectedArea: selectedAreaReducer,
  viewport: viewportReducer
});
