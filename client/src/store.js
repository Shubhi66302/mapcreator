import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";
import reducer from "reducers/reducer";
import { TILE_WIDTH, TILE_HEIGHT } from "./constants";
import { normalizeMap } from "utils/normalizr";
import { entityMiddleware, floorMiddleware } from "actions/middlewares";
// TEST: using sampleMap from test-data to initialize store.
import sampleMapObj from "test-data/test-maps/3x3-with-pps-charger-fireemergencies.json";

// using mapObj as source of truth in store. tiles etc. will be derived from it.
const logger = createLogger({
  // options
  // diff: true,
  // do not log drag-move messages
  predicate: (_getState, { type }) => !/DRAG-MOVE/.test(type)
});

// TODO: shouldn't have to define default state both here and in reducer.js, find a way to do it only in one place
export default createStore(
  reducer,
  {
    normalizedMap: normalizeMap(sampleMapObj),
    currentFloor: 1,
    // NOTE: selected tiles is also a map for efficiency reasons
    selection: {
      queueMode: false,
      mapTiles: {},
      distanceTiles: {}
    },
    // TODO: implement zone view
    zoneView: false,
    spritesheetLoaded: false,
    selectedArea: null,
    viewport: {
      metaKey: false,
      shiftKey: false,
      viewportInstance: null,
      currentView: null
    }
  },
  applyMiddleware(thunk, entityMiddleware, floorMiddleware, logger)
);
