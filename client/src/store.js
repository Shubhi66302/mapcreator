import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";
import reducer from "reducers/reducer";
import { TILE_WIDTH, TILE_HEIGHT } from "./constants";
import { normalizeMap } from "utils/normalizr";
// TEST: using sampleMap from test-data to initialize store.
import sampleMapObj from "test-data/test-maps/3x3-with-pps-charger-fireemergencies.json";

// adding test data for pixi rendering
// TODO: make spritesheet
// TODO: initialization of rows, cols can't be done in this file, should be done by
// let tileIds = [];
// let tileDict = {};
// const [rows, cols] = [50, 50];
// for (var row = 0; row < rows; row++) {
//   for (var col = 0; col < cols; col++) {
//     var id = `${row},${col}`;
//     tileIds.push(id);
//     tileDict[id] = {
//       x: col * TILE_WIDTH,
//       y: row * TILE_HEIGHT,
//       spriteNames: [
//         // first is tile
//         "0.png",
//         // now ddd.ddd, TODO: make proper barcode out of these
//         "1.png",
//         "2.png",
//         "3.png",
//         "dot.png",
//         "4.png",
//         "5.png",
//         "6.png"
//         // all 8 sprites: tile + ddd.ddd
//       ]
//     };
//   }
// }
// export default createStore(reducer, { tileIds, tileDict });

// using mapObj as source of truth in store. tiles etc. will be derived from it.
const logger = createLogger({
  // options
  // diff: true
});

export const dummyState = {
  normalizedMap: normalizeMap({
    id: "1",
    name: "dummy",
    map: {
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
  zoneView: false,
  randomSpriteName: "0.png"
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
    // HACK: testing sprite name
    randomSpriteName: "0.png"
  },
  applyMiddleware(thunk, logger)
  // applyMiddleware(logger)
);
