import {
  getDirection,
  getNeighbouringBarcodes,
  getNeighbouringCoordinateKeys
} from "utils/util";
import _ from "lodash";

export const addPPSQueue = (state = {}, action) => {
  const tileIds = action.value.coordinates;
  const { error, reason } = validateBarcodesFormAQueue(tileIds, state);
  if (error) {
    throw new Error(`Cannot add queue: ${reason}`);
  }
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
      var nonQueueNeighbours = _.filter(allNeighbours, function(tile) {
        return tile != null && !_.includes(tileIds, tile.coordinate);
      });
      // disallow movement to all neighbours which are queue barcodes and not in queue direction.
      allNeighbours.forEach((nb, idx) => {
        if (nb && _.includes(tileIds, nb.coordinate) && idx != QueueDirection) {
          newState[tileId].neighbours[idx][2] = 0;
        }
      });
      if (i != 0) {
        if (QueueDirection != 5) {
          newState[tileId].neighbours[QueueDirection][1] = 1;
          newState[tileId].neighbours[QueueDirection][2] = 1;
          let Remaining = _.difference([0, 1, 2, 3], [QueueDirection]);

          for (let j = 0; j < Remaining.length; j++) {
            newState[tileId].neighbours[Remaining[j]][2] = 0;
          }

          nonQueueNeighbours.forEach(neighbouringTileIdobject => {
            var neighbouringTileId = neighbouringTileIdobject.coordinate;
            var current_neighbour_dir = getDirection(
              tileId,
              neighbouringTileId
            );
            var neighbour_current_dir = (current_neighbour_dir + 2) % 4;
            newState[neighbouringTileId].neighbours[
              neighbour_current_dir
            ][2] = 0;
          });
        } else {
          var endQueuedir = getDirection(tileIds[i - 1], tileId);
          var endoppQuedir = (endQueuedir + 2) % 4;
          newState[tileId].neighbours[endoppQuedir][2] = 0;
          nonQueueNeighbours.forEach(neighbouringTileIdobjectend => {
            var neighbouringTileIdend = neighbouringTileIdobjectend.coordinate;
            var endcurrdir = getDirection(tileId, neighbouringTileIdend);
            var endnbrdir = (endcurrdir + 2) % 4;
            // do NOT allow any non-queue neighbour to enter exit barcode
            newState[neighbouringTileIdend].neighbours[endnbrdir][2] = 0;
          });
        }
      } else {
        // disable movement from starting barcode to other non-queue barcodes
        let Remaining = _.difference([0, 1, 2, 3], [QueueDirection]);
        for (let j = 0; j < Remaining.length; j++) {
          newState[tileId].neighbours[Remaining[j]][2] = 0;
        }
      }
    }
  }

  return { ...state, ...newState };
};

// exported for testing
export const validateBarcodesFormAQueue = (tileIds, barcodesDict) => {
  if (tileIds.length < 2)
    return {
      error: true,
      reason: "Atleast 2 barcodes required"
    };
  for (var i = 1; i < tileIds.length; i++) {
    var curTileId = tileIds[i];
    var prevTileId = tileIds[i - 1];
    // make sure prev barcode has current barcode as neighbour
    if (
      getNeighbouringCoordinateKeys(prevTileId, barcodesDict).find(
        coordinateKey => coordinateKey == curTileId
      ) === undefined
    )
      return {
        error: true,
        reason: "Some barcodes are not consecutive or disconnected"
      };
  }
  return { error: false };
};

// not sharing logic with addPPSQueue since hard to abstract out its implementation..
// highway queues are defined as:
// 1. All neighbours except in queue direction are [1,0,0] (i.e. butler movement both with/without rack is disallowed)
// 2. Adjacent non-queue neighbours to queue barcode movement is allowed (i.e. unlike pps queue as pps queue can only be entered
// through pps entry barcode, whereas highway queue can be entered from any barcode)
export const addHighwayQueue = (state = {}, action) => {
  const tileIds = action.value.coordinates;
  const { error, reason } = validateBarcodesFormAQueue(tileIds, state);
  if (error) {
    throw new Error(`Cannot add queue: ${reason}`);
  }
  const newState = {};
  // looping over all barcodes except for queue exit barcode
  for (var i = 0; i < tileIds.length - 1; i++) {
    const tileId = tileIds[i];
    newState[tileId] = _.clone(state[tileId]);
    const queueDirection = getDirection(tileId, tileIds[i + 1]);
    // disable movement completely in all directions except queue direction
    [0, 1, 2, 3].forEach(direction => {
      if (direction != queueDirection) {
        newState[tileId].neighbours[direction][1] = 0;
        newState[tileId].neighbours[direction][2] = 0;
      }
    });
  }
  // for last element, get the queue reverse direction, and disable that only
  const length = tileIds.length;
  var forwardDirection = getDirection(tileIds[length - 2], tileIds[length - 1]);
  var backwardDirection = (forwardDirection + 2) % 4;
  var lastTileId = tileIds[length - 1];
  newState[lastTileId] = _.clone(state[lastTileId]);
  newState[lastTileId].neighbours[backwardDirection][1] = 0;
  newState[lastTileId].neighbours[backwardDirection][2] = 0;
  return { ...state, ...newState };
};
