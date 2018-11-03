import {
  getNeighbourTiles,
  getNeighbouringBarcodes,
  deleteNeighbourFromBarcode
} from "utils/util";
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
  }
  return state;
};
