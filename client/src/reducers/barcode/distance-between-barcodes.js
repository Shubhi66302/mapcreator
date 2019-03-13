import { getNeighbouringBarcodes } from "utils/util";
import {
  getAllColumnTileIdTuples,
  getAllRowTileIdTuples
} from "utils/selectors";
import _ from "lodash";

export const modifyDistanceBetweenBarcodes = (state, action) => {
  // iterate over all rows/cols and modify
  let newState = {};
  var { distanceTiles, distance, tileBounds } = action.value;
  for (let key in distanceTiles) {
    let tuples, direction;
    if (/c-.*/.test(key)) {
      // column
      tuples = getAllColumnTileIdTuples(tileBounds, key);
      direction = 3;
    } else {
      // row
      tuples = getAllRowTileIdTuples(tileBounds, key);
      direction = 2;
    }
    const distances = [distance / 2, distance / 2];
    tuples.forEach(([tile1, tile2]) => {
      [
        [tile1, direction, distances[0]],
        [tile2, (direction + 2) % 4, distances[1]]
      ].forEach(([tile, dir, val]) => {
        if (!state[tile]) return;
        if (state[tile].adjacency) {
          var nbInDirection = getNeighbouringBarcodes(tile, state)[dir];
          // don't mess with special barcodes or their neighbours
          if (nbInDirection && nbInDirection.special) {
            return;
          }
        }
        if (!newState[tile]) newState[tile] = _.cloneDeep(state[tile]);
        newState[tile].size_info[dir] = val;
      });
    });
  }
  return { ...state, ...newState };
};
