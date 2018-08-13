import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";
import reducer from "reducers/reducer";
import { TILE_WIDTH, TILE_HEIGHT } from "./constants";
import { normalizeMap } from "utils/normalizr";
// TEST: using sampleMap from test-data to initialize store.
import sampleMapObj from "test-data/test-maps/3x3-with-pps-charger-fireemergencies.json";

// using mapObj as source of truth in store. tiles etc. will be derived from it.
const logger = createLogger({
  // options
  // diff: true
});

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
  zoneView: false
};

export default createStore(
  reducer,
  {
    normalizedMap: normalizeMap(sampleMapObj),
    currentFloor: 1,
    // NOTE: selected tiles is also a map for efficiency reasons
    selectedTiles: {},
    // TODO: implement zone view
    zoneView: false,
    spritesheetLoaded: false
  },
  applyMiddleware(thunk, logger)
  // applyMiddleware(logger)
);
