import { TILE_WIDTH, TILE_HEIGHT } from "../constants";
import { normalizeMap } from "utils/normalizr";

export default (state, action) => {
  switch (action.type) {
    case "CLICK-ON-TILE":
      console.log("reducing click action");
      const tileId = action.value;
      const { selectedTiles } = state;
      if (selectedTiles[tileId]) {
        var newSelectedTiles = Object.assign({}, selectedTiles);
        delete newSelectedTiles[tileId];
        return { ...state, selectedTiles: newSelectedTiles };
      } else {
        return { ...state, selectedTiles: { ...selectedTiles, [tileId]: {} } };
      }
    case "NEW-MAP":
      // we got a new map
      console.log("reducing new map action");
      const map = action.value;
      return {
        ...state,
        normalizedMap: normalizeMap(map),
        currentFloor: 1,
        selectedTiles: {},
        zoneView: false
      };
    case "ADD-PPS":
      console.log("adding new pps");
      const pps = action.value;
      const { entities } = state.normalizedMap;
      pps.pps_id = Object.keys(entities.pps || {}).length + 1;
      const currentFloorObj =
        state.normalizedMap.entities.floor[state.currentFloor];
      // console.log(entities);
      return {
        ...state,
        normalizedMap: {
          ...state.normalizedMap,
          entities: {
            ...entities,
            pps: {
              ...entities.pps,
              [pps.pps_id]: pps
            },
            floor: {
              ...entities.floor,
              [state.currentFloor]: {
                ...currentFloorObj,
                ppses: [...currentFloorObj.ppses, pps.pps_id]
              }
            }
          }
        }
      };
    case "CHANGE-RANDOM-SPRITE":
      return { ...state, randomSpriteName: action.value };
  }
  return state;
};
