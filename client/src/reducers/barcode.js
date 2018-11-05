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

// exported for testing
export var calculateDistances = (
  tuples,
  distance,
  botWithRackThreshold,
  botWithoutRackThreshold,
  barcodeDict
) => {
  // count storables
  var firstStorables = tuples
    .map(
      ([first, _second]) =>
        barcodeDict[first] ? barcodeDict[first].store_status : false
    )
    .reduce((acc, curr) => (acc + curr ? 1 : 0));
  var secondStorables = tuples
    .map(
      ([_first, second]) =>
        barcodeDict[second] ? barcodeDict[second].store_status : false
    )
    .reduce((acc, curr) => (acc + curr ? 1 : 0));
  if (firstStorables == 0 && secondStorables == 0)
    return [distance / 2, distance / 2];
  var bigDistance = botWithRackThreshold;
  var smallDistance = distance - bigDistance;
  if (smallDistance >= botWithoutRackThreshold) {
    if (firstStorables >= secondStorables) return [smallDistance, bigDistance];
    return [bigDistance, smallDistance];
  }
  return [distance / 2, distance / 2];
};

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
      var {
        distanceTiles,
        distance,
        tileBounds,
        botWithRackThreshold,
        botWithoutRackThreshold
      } = action.value;
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
        const distances = calculateDistances(
          tuples,
          distance,
          botWithRackThreshold,
          botWithoutRackThreshold,
          state
        );
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
    }
    case "MODIFY-BARCODE-NEIGHBOURS": {
      var { tileId, values } = action.value;
      if (!state[tileId]) return state;
      var newBarcode = _.cloneDeep(state[tileId]);
      ["top", "right", "bottom", "left"].forEach((key, idx) => {
        var matches = values[key].neighbours.match(/(\d),(\d),(\d)/);
        newBarcode.neighbours[idx] = [
          parseInt(matches[1]),
          parseInt(matches[2]),
          parseInt(matches[3])
        ];
        newBarcode.size_info[idx] = parseInt(values[key].sizeInfo);
      });
      return { ...state, [tileId]: newBarcode };
    }
  }
  return state;
};
