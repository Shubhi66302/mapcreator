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
  viewport: {
    shiftKey: false,
    metaKey: false,
    viewportInstance: null,
    minimapInstance: null,
    currentView: null
  }
};

// exporting reducers for testing
export var baseBarcodeReducer = createEntityReducer("BARCODE", "coordinate");
export var basePPSReducer = createEntityReducer("PPS", "pps_id");

export var ppsReducer = (state = {}, action) => {
  switch (action.type) {
    case "ADD-QUEUE-BARCODES-TO-PPS":
      // console.log(action.value);
      // console.log(state);

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
  elevator: createEntityReducer("ELEVATOR", "elevator_id"),
  queueData: createEntityReducer("QUEUE-DATA", "queue_data_id"),
  charger: createEntityReducer("CHARGER", "charger_id"),
  pps: reduceReducers(basePPSReducer, ppsReducer),
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

export const toggleKeyInMapWhenQueueMode = (state, tileId) => {
  var a = _.reduce(
    state,
    function(acc, value, key) {
      console.log(key);

      return Math.max(acc, value);
    },
    0
  );
  console.log(a);
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
      return {};
    // case "CLICK-ON-DISTANCE-TILE":
    //   return toggleKeyInMap(state, action.value);
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
    // case "CLICK-ON-MAP-TILE":

    //   return toggleKeyInMap(state, action.value);
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
      const tileId = action.value;
      if (!state.queueMode) {
        if (state.mapTiles[tileId]) {
          // delete tile from selected
          const { [tileId]: toDelete_, ...rest } = state.mapTiles;
          return { ...state, mapTiles: { ...rest } };
        } else {
          // using true to signify tile is selected. doesn't really matter what
          // the value is, just interested in the key
          return { ...state, mapTiles: { ...state.mapTiles, [tileId]: true } };
        }
      } else {
        var a = _.reduce(
          state.mapTiles,
          function(acc, value, key) {
            console.log(key);

            return Math.max(acc, value);
          },
          0
        );
        console.log(a);
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
        console.log("queue mode is off");
        return { ...state };
      } else {
        const selectedMapTiles = action.value;
        var newState = {};
        for (let tileId of Object.keys(selectedMapTiles)) {
          //   newState[tileId] = { ...state[tileId], store_status: 1 };
          //   if (newState[tileId].neighbours) {
          //     var neighbouringTileIds = getNeighbourTiles(tileId);
          //     neighbouringTileIds.forEach((neighbouringTileId, idx) => {
          //       // only get neighbours that have already been added to new state. this
          //       // reduces redundant updates
          //       if (newState[neighbouringTileId]) {
          //         // cannot traverse rack to rack
          //         newState[neighbouringTileId].neighbours[(idx + 2) % 4][2] = 0;
          //         newState[tileId].neighbours[idx][2] = 0;
          //       }
          //     });
          //   }
          console.log("logging");
          console.log(tileId);
        }
        return Object.assign({}, state, newState);
      }
    case "DRAG-END":
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
  normalizedMap: mapReducer,
  currentFloor: currentFloorReducer,
  selection: reduceReducers(selectionReducer, baseSelectionReducer),
  zoneView: z => z || false,
  spritesheetLoaded: spritesheetLoadedReducer,
  selectedArea: selectedAreaReducer,
  viewport: viewportReducer
});
