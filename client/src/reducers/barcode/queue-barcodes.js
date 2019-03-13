import { getDirection, getNeighbouringBarcodes } from "utils/util";
import _ from "lodash";

export const addQueueBarcodesToPps = (state = {}, action) => {
  const tileIds = action.value.coordinates;
  const pps_coordinate = action.value.pps_coordinate;
  var newState = _.cloneDeep(state);
  for (var i = 0; i < tileIds.length; i++) {
    var tileId = tileIds[i];

    if (newState[tileId].neighbours) {
      var QueueDirection;
      if (i == tileIds.length - 1) {
        QueueDirection = 5;
      } else {
        QueueDirection = getDirection(tileId, tileIds[i + 1]);
      }
      var allNeighbours = getNeighbouringBarcodes(tileId, state);
      var filteredNeighbours = _.filter(allNeighbours, function(tile) {
        return tile != null && !_.includes(tileIds, tile.coordinate);
      });
      // if pps is a neighbour, do not allow movement there
      allNeighbours.forEach((nb, idx) => {
        if (nb && pps_coordinate == nb.coordinate) {
          newState[tileId].neighbours[idx][2] = 0;
        }
      });
      if (i != 0) {
        if (QueueDirection != 5) {
          newState[tileId].neighbours[QueueDirection][1] = 1;
          newState[tileId].neighbours[QueueDirection][2] = 1;
          var Remaining = _.difference([0, 1, 2, 3], [QueueDirection]);

          for (var j = 0; j < Remaining.length; j++) {
            newState[tileId].neighbours[Remaining[j]][2] = 0;
          }

          filteredNeighbours.forEach(neighbouringTileIdobject => {
            var neighbouringTileId = neighbouringTileIdobject.coordinate;
            var current_neighbour_dir = getDirection(
              tileId,
              neighbouringTileId
            );
            // var prevQueDir = getDirection(tileIds[i-1],tileId);
            var neighbour_current_dir = (current_neighbour_dir + 2) % 4;
            newState[neighbouringTileId].neighbours[
              neighbour_current_dir
            ][2] = 0;
          });
        } else {
          var endQueuedir = getDirection(tileIds[i - 1], tileId);
          var endoppQuedir = (endQueuedir + 2) % 4;
          newState[tileId].neighbours[endoppQuedir][2] = 0;
          filteredNeighbours.forEach(neighbouringTileIdobjectend => {
            var neighbouringTileIdend = neighbouringTileIdobjectend.coordinate;
            var endcurrdir = getDirection(tileId, neighbouringTileIdend);
            var endnbrdir = (endcurrdir + 2) % 4;
            if (endcurrdir != endQueuedir && endcurrdir != endoppQuedir) {
              newState[neighbouringTileIdend].neighbours[endnbrdir][2] = 0;
            }
          });
        }
      }
    }
  }

  return { ...state, ...newState };
};
