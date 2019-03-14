import {
  getDirection,
  getNeighbouringBarcodes,
  deleteNeighbourFromBarcode,
  implicitCoordinateKeyToBarcode,
  tupleOfIntegersToCoordinateKey,
  implicitBarcodeToCoordinate,
  coordinateKeyToTupleOfIntegers
} from "utils/util";
import {
  getAllColumnTileIdTuples,
  getAllRowTileIdTuples
} from "utils/selectors";
import _ from "lodash";

// in elevator it is stored as [{coordinate: [10,11], direction: 2}, ..] etc.
// making it ["10,11", ..]
var elevatorCoordinateListConverter = coordinate_list =>
  coordinate_list.map(({ coordinate }) =>
    tupleOfIntegersToCoordinateKey(coordinate)
  );

export var changeElevatorCoordinates = (
  state,
  elevatorPosition,
  old_coordinate_list,
  coordinate_list
) => {
  var newState = {};
  const oldCoordinates = elevatorCoordinateListConverter(old_coordinate_list);
  // reset barcodes for all old coordinates to their origin value (assumed to be "030.020" for {20,30} etc. )
  oldCoordinates.forEach(coordinate => {
    newState[coordinate] = {
      ...state[coordinate],
      barcode: implicitCoordinateKeyToBarcode(coordinate)
    };
  });
  // make all new barcodes have the same barcode string as elevatorPosition
  const newCoordinates = elevatorCoordinateListConverter(coordinate_list);
  newCoordinates.forEach(coordinate => {
    newState[coordinate] = { ...state[coordinate], barcode: elevatorPosition };
  });
  return { ...state, ...newState };
};

// make queue coordinate unidirectional
var fixQueueCoordinateNeighbours = (newState, tileId, QueueDirection) => {
  if (QueueDirection != 5) {
    newState[tileId].neighbours[QueueDirection][1] = 1;
    newState[tileId].neighbours[QueueDirection][2] = 1;
    var Remaining = _.difference([0, 1, 2, 3], [QueueDirection]);
    for (var j = 0; j < Remaining.length; j++) {
      newState[tileId].neighbours[Remaining[j]][2] = 0;
    }
  }
  return newState;
};

export default (state = {}, action) => {
  switch (action.type) {
    case "ADD-QUEUE-BARCODES-TO-PPS": {
      const tileIds = action.value.coordinates;
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
          if (i != 0) {
            if (QueueDirection != 5) {
              newState = fixQueueCoordinateNeighbours(
                newState,
                tileId,
                QueueDirection
              );
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
                var neighbouringTileIdend =
                  neighbouringTileIdobjectend.coordinate;
                var endcurrdir = getDirection(tileId, neighbouringTileIdend);
                var endnbrdir = (endcurrdir + 2) % 4;
                if (endcurrdir != endQueuedir && endcurrdir != endoppQuedir) {
                  newState[neighbouringTileIdend].neighbours[endnbrdir][2] = 0;
                }
              });
            }
          } else {
            // first queue coordinate neighbour structure also needs to change
            newState = fixQueueCoordinateNeighbours(
              newState,
              tileId,
              QueueDirection
            );
          }
        } 
      }
      return { ...state, ...newState };
    }

    case "TOGGLE-STORABLE": {
      const {selectedTiles, makeStorable} = action.value;
      newState = {};
      for (let tileId of selectedTiles) {
        newState[tileId] = { ...state[tileId], store_status: makeStorable };
      }
      return Object.assign({}, state, newState);
    }
    case "DELETE-BARCODES": {
      // iterate over all barcodes and just see if their neighbours exist. if not, make the edge [0,0,0]
      let newState = {};
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
    }
    case "MODIFY-BARCODE-NEIGHBOURS": {
      var { values } = action.value;
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
    case "ADD-FLOOR": {
      const { map_values } = action.value;
      const keys = map_values.map(barcode => barcode.coordinate);
      const newBarcodesObj = _.fromPairs(_.zip(keys, map_values));
      return { ...state, ...newBarcodesObj };
    }
    case "ASSIGN-ZONE": {
      const { zone_id, mapTiles } = action.value;
      let newState = {};
      Object.keys(mapTiles).forEach(
        key => (newState[key] = { ...state[key], zone: zone_id })
      );
      return { ...state, ...newState };
    }
    case "ADD-ELEVATOR": {
      return changeElevatorCoordinates(
        state,
        action.value.position,
        [],
        action.value.coordinate_list
      );
    }
    case "EDIT-ELEVATOR-COORDINATES": {
      const {
        old_coordinate_list,
        coordinate_list,
        elevator_position
      } = action.value;
      return changeElevatorCoordinates(
        state,
        elevator_position,
        old_coordinate_list,
        coordinate_list
      );
    }
    case "EDIT-BARCODE": {
      const { coordinate, new_barcode } = action.value;
      if (_.find(state, { barcode: new_barcode }) !== undefined) return state;
      newState = _.cloneDeep(state);
      var new_coordinate = implicitBarcodeToCoordinate(new_barcode);
      var [oldx, oldy] = coordinateKeyToTupleOfIntegers(coordinate);
      var [newx, newy] = coordinateKeyToTupleOfIntegers(new_coordinate);
      var newCoordinateKey = tupleOfIntegersToCoordinateKey([newx, newy]);
      allNeighbours = getNeighbouringBarcodes(coordinate, newState);
      for (var indx in allNeighbours) {
        // list of neighbours like {0:null, 1:{store..}...}
        if (allNeighbours[indx]) {
          for (var adj in allNeighbours[indx].adjacency) {
            if (
              allNeighbours[indx].adjacency[adj] &&
              allNeighbours[indx].adjacency[adj][0] == oldx &&
              allNeighbours[indx].adjacency[adj][1] == oldy
            ) {
              allNeighbours[indx].adjacency[adj] = [newx, newy];
            }
          }
        }
      }
      //Lastly update the coordinate value itself.
      newState[newCoordinateKey] = {
        ...state[coordinate],
        coordinate: newCoordinateKey,
        barcode: new_barcode
      };
      delete newState[coordinate];
      return newState;
    }
    case "DELETE-CHARGER-DATA": {
      const chargerInfo = action.value.chargerDetails;
      const entryPointCoordinate = implicitBarcodeToCoordinate(chargerInfo.entry_point_location);
      const chargerCoordinate = chargerInfo.coordinate;
      const chargerDirection = chargerInfo.charger_direction;
      var index = 0;
      var totalDistance = 0;
      var coorInDirectionOfCharger;
      let newState = _.cloneDeep(state);
      // update neighbours' adjacency such that they no longer point to this barcode.
      var chargerNeighbours = getNeighbouringBarcodes(chargerCoordinate, newState);
      var entryPointNeighbours = getNeighbouringBarcodes(entryPointCoordinate, newState);
      coorInDirectionOfCharger = tupleOfIntegersToCoordinateKey(newState[entryPointCoordinate].adjacency[chargerDirection]);
      // Update the distance first.
      _.forEach(entryPointNeighbours, function (entryNeighbour) {
        if (entryNeighbour) {
          if (entryNeighbour.coordinate == chargerCoordinate) {
            totalDistance += entryNeighbour.size_info[chargerDirection];
          }
          if (entryNeighbour.neighbours[index][0] ==! 0) {
            entryNeighbour.neighbours[index] = [1,1,1];
          }
          delete entryNeighbour.adjacency;
        }
        index++;
      });
      totalDistance += newState[coorInDirectionOfCharger].size_info[(chargerDirection+2)%4];
      if (newState[coorInDirectionOfCharger].neighbours[(chargerDirection+2)%4][0] ==1) {
        newState[coorInDirectionOfCharger].neighbours[(chargerDirection+2)%4] = [1,1,1];
      }
      index = 0;
      _.forEach(chargerNeighbours, function (chargerNeighbour) {
        if (chargerNeighbour) {
          if (chargerNeighbour.coordinate == entryPointCoordinate) {
            totalDistance += chargerNeighbour.size_info[chargerDirection]+
                                  newState[entryPointCoordinate].size_info[(chargerDirection+2) % 4];
          }
          if (chargerNeighbour.neighbours[index][0] ==! 0) {
            chargerNeighbour.neighbours[index] = [1,1,1];
          }
          delete chargerNeighbour.adjacency;
        }
          
        index++;
      });
      if(newState[chargerCoordinate].neighbours[chargerDirection][0] ==1){
        newState[chargerCoordinate].neighbours[chargerDirection] = [1,1,1];
      }
      newState[chargerCoordinate].size_info[chargerDirection] = totalDistance/2;
      newState[coorInDirectionOfCharger].size_info[(chargerDirection+2) %4] = totalDistance/2;
      delete newState[chargerCoordinate].adjacency;
      delete newState[coorInDirectionOfCharger].adjacency;
      delete newState[entryPointCoordinate];
      return newState;
    }
  }
  return state;
};
