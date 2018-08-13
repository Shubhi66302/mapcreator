import { TILE_WIDTH, TILE_HEIGHT } from "../constants";
import { normalizeMap } from "utils/normalizr";
import { dummyState } from "../store";
import { combineReducers } from "redux";
import { createEntityReducer } from "./util";
import reduceReducers from "reduce-reducers";
import floorReducer from "./floor";
import barcodeReducer from "./barcode";

const entitiesReducer = combineReducers({
  elevator: createEntityReducer("ELEVATOR", "elevator_id"),
  queueData: createEntityReducer("QUEUE_DATA", "queue_data_id"),
  charger: createEntityReducer("CHARGER", "charger_id"),
  pps: createEntityReducer("PPS", "pps_id"),
  ods: createEntityReducer("ODS", "ods_id"),
  dockPoint: createEntityReducer("DOCK_POINT", "dock_point_id"),
  fireEmergency: createEntityReducer("FIRE_EMERGENCY", "fire_emergency_id"),
  // TODO: make reducers for these
  // using identity reducers for rest for now?
  barcode: barcodeReducer,
  floor: floorReducer,
  map: m => m || null,
  mapObj: m => m || null
});

const mapUpdateReducer = combineReducers({
  entities: entitiesReducer,
  result: r => r || null
});

// for full map updates eg. clear, new
const mapChangeReducer = (state = dummyState.normalizedMap, action) => {
  switch (action.type) {
    case "CLEAR-MAP":
      return dummyState.normalizedMap;
    case "NEW-MAP":
      return normalizeMap(action.value);
  }
  return state;
};

const mapReducer = reduceReducers(mapUpdateReducer, mapChangeReducer);

const currentFloorReducer = (state = 1, action) => {
  switch (action.type) {
    case "CLEAR-MAP":
    case "NEW-MAP":
      return 1;
    case "CHANGE-FLOOR":
      return action.value;
  }
  return state;
};

const selectedTilesReducer = (state = {}, action) => {
  switch (action.type) {
    case "CLEAR-MAP":
    case "NEW-MAP":
    case "CLEAR-SELECTED-TILES":
      return {};
    case "CLICK-ON-TILE":
      const tileId = action.value;
      if (state[tileId]) {
        // delete tile from selected
        const { [tileId]: toDelete_, ...rest } = state;
        return { ...rest };
      } else {
        // using an empty dict just to signify tile is selected.
        return { ...state, [tileId]: {} };
      }
  }
  return state;
};

const spritesheetLoadedReducer = (state = false, action) => {
  switch (action.type) {
    case "LOADED-SPRITESHEET":
      return true;
  }
  return state;
};

export default combineReducers({
  normalizedMap: mapReducer,
  currentFloor: currentFloorReducer,
  selectedTiles: selectedTilesReducer,
  zoneView: z => z || false,
  spritesheetLoaded: spritesheetLoadedReducer
});

// export default (state = dummyState, action) => {
//   switch (action.type) {
//     case "CLICK-ON-TILE":
//       console.log("reducing click action");
//       const tileId = action.value;
//       const { selectedTiles } = state;
//       if (selectedTiles[tileId]) {
//         var newSelectedTiles = Object.assign({}, selectedTiles);
//         delete newSelectedTiles[tileId];
//         return { ...state, selectedTiles: newSelectedTiles };
//       } else {
//         return { ...state, selectedTiles: { ...selectedTiles, [tileId]: {} } };
//       }
//     case "CLEAR-MAP":
//       const { normalizedMap, ...rest } = state;
//       return { ...rest };
//     // return dummyState;
//     case "NEW-MAP":
//       // we got a new map
//       console.log("reducing new map action");
//       const map = action.value;
//       return {
//         ...state,
//         normalizedMap: normalizeMap(map),
//         currentFloor: 1,
//         selectedTiles: {},
//         zoneView: false
//       };
//     case "ADD-PPS":
//       console.log("adding new pps");
//       const pps = action.value;
//       const { entities } = state.normalizedMap;
//       pps.pps_id = Object.keys(entities.pps || {}).length + 1;
//       const currentFloorObj =
//         state.normalizedMap.entities.floor[state.currentFloor];
//       // console.log(entities);
//       return {
//         ...state,
//         normalizedMap: {
//           ...state.normalizedMap,
//           entities: {
//             ...entities,
//             pps: {
//               ...entities.pps,
//               [pps.pps_id]: pps
//             },
//             floor: {
//               ...entities.floor,
//               [state.currentFloor]: {
//                 ...currentFloorObj,
//                 ppses: [...currentFloorObj.ppses, pps.pps_id]
//               }
//             }
//           }
//         }
//       };
//     case "CHANGE-RANDOM-SPRITE":
//       return { ...state, randomSpriteName: action.value };
//     case "LOADED-SPRITESHEET":
//       return { ...state, spritesheetLoaded: true };
//   }
//   return state;
// };
