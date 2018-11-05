import {
  getNeighbourTiles,
  getNeighbouringBarcodes,
  deleteNeighbourFromBarcode
} from "utils/util";
import {
  getAllColumnTileIdTuples,
  getAllRowTileIdTuples
} from "utils/selectors";
import _ from "lodash";

export default (state = {}, action) => {
  switch (action.type) {
    case "ASSIGN-STORABLE":
      const selectedMapTiles = action.value;
      var newState = {};
      for (let tileId of Object.keys(selectedMapTiles)) {
        newState[tileId] = { ...state[tileId], store_status: 1 };
        if (newState[tileId].neighbours) {
          var neighbouringTileIds = getNeighbourTiles(tileId);
          neighbouringTileIds.forEach((neighbouringTileId, idx) => {
            // only get neighbours that have already been added to new state. this
            // reduces redundant updates
            if (newState[neighbouringTileId]) {
              // cannot traverse rack to rack
              newState[neighbouringTileId].neighbours[(idx + 2) % 4][2] = 0;
              newState[tileId].neighbours[idx][2] = 0;
            }
          });
        }
      }
      return Object.assign({}, state, newState);
    case "DELETE-BARCODES": {
      // iterate over all barcodes and just see if their neighbours exist. if not, make the edge [0,0,0]
      var newState = {};
      var tileIdMap = action.value;
      for (let key of Object.keys(tileIdMap)) {
        if (state[key]) {
          var neighbours = getNeighbouringBarcodes(key, state);
          for (const [idx, nb] of neighbours.entries()) {
            if (nb && !tileIdMap[nb.coordinate]) {
              // its a valid neighbour of the deleted barcode that itself won't be deleted
              if (!newState[nb.coordinate])
                newState[nb.coordinate] = state[nb.coordinate];
              newState[nb.coordinate] = deleteNeighbourFromBarcode(
                newState[nb.coordinate],
                (idx + 2) % 4,
                false
              );
            }
          }
        }
      }
      return { ..._.omit(state, Object.keys(tileIdMap)), ...newState };
    }
    case "MODIFY-DISTANCE-BETWEEN-BARCODES": {
      // iterate over all rows/cols and modify
      var newState = {};
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
        tuples.forEach(([tile1, tile2]) => {
          // don't mess with special barcodes or their neighbours
          if (state[tile1].special || state[tile2].special) return;
          if (!newState[tile1]) newState[tile1] = _.cloneDeep(state[tile1]);
          if (!newState[tile2]) newState[tile2] = _.cloneDeep(state[tile2]);
          newState[tile1].size_info[direction] = distance;
          newState[tile2].size_info[(direction + 2) % 4] = distance;
        });
      }
      return { ...state, ...newState };
    }
  }
  return state;
};
