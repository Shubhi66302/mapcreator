import {
  getDirection,
  getNeighbouringBarcodes,
  implicitCoordinateKeyToBarcode,
  tupleOfIntegersToCoordinateKey,
  implicitBarcodeToCoordinate
} from "utils/util";
import _ from "lodash";

const deleteChargerData = (state, action) => {
  const chargerInfo = action.value.chargerDetails;
  const entryPointCoordinate = implicitBarcodeToCoordinate(
    chargerInfo.entry_point_location
  );
  const chargerCoordinate = chargerInfo.coordinate;
  const chargerDirection = chargerInfo.charger_direction;
  var index = 0;
  var totalDistance = 0;
  var coorInDirectionOfCharger;
  let newState = _.cloneDeep(state);
  // update neighbours' adjacency such that they no longer point to this barcode.
  var chargerNeighbours = getNeighbouringBarcodes(chargerCoordinate, newState);
  var entryPointNeighbours = getNeighbouringBarcodes(
    entryPointCoordinate,
    newState
  );
  coorInDirectionOfCharger = tupleOfIntegersToCoordinateKey(
    newState[entryPointCoordinate].adjacency[chargerDirection]
  );
  // Update the distance first.
  _.forEach(entryPointNeighbours, function(entryNeighbour) {
    if (entryNeighbour) {
      if (entryNeighbour.coordinate == chargerCoordinate) {
        totalDistance += entryNeighbour.size_info[chargerDirection];
      }
      if (entryNeighbour.neighbours[index][0] == !0) {
        entryNeighbour.neighbours[index] = [1, 1, 1];
      }
      delete entryNeighbour.adjacency;
    }
    index++;
  });
  totalDistance +=
    newState[coorInDirectionOfCharger].size_info[(chargerDirection + 2) % 4];
  if (
    newState[coorInDirectionOfCharger].neighbours[
      (chargerDirection + 2) % 4
    ][0] == 1
  ) {
    newState[coorInDirectionOfCharger].neighbours[
      (chargerDirection + 2) % 4
    ] = [1, 1, 1];
  }
  index = 0;
  _.forEach(chargerNeighbours, function(chargerNeighbour) {
    if (chargerNeighbour) {
      if (chargerNeighbour.coordinate == entryPointCoordinate) {
        totalDistance +=
          chargerNeighbour.size_info[chargerDirection] +
          newState[entryPointCoordinate].size_info[(chargerDirection + 2) % 4];
      }
      if (chargerNeighbour.neighbours[index][0] == !0) {
        chargerNeighbour.neighbours[index] = [1, 1, 1];
      }
      delete chargerNeighbour.adjacency;
    }

    index++;
  });
  if (newState[chargerCoordinate].neighbours[chargerDirection][0] == 1) {
    newState[chargerCoordinate].neighbours[chargerDirection] = [1, 1, 1];
  }
  newState[chargerCoordinate].size_info[chargerDirection] = totalDistance / 2;
  newState[coorInDirectionOfCharger].size_info[(chargerDirection + 2) % 4] =
    totalDistance / 2;
  delete newState[chargerCoordinate].adjacency;
  delete newState[coorInDirectionOfCharger].adjacency;
  delete newState[entryPointCoordinate];
  return newState;
};

const deletePPSQueue = (state, action) => {
  const { queue_coordinates } = action.value;
  let newState = _.clone(state);
  var direction;

  _.forEach(queue_coordinates, function(queuePoint) {
    // Allow all movements in all directions. assuming we dont have any
    // barcode modified otherwise (besides making it a queue).
    var neighboursOfQueueCoordinate = getNeighbouringBarcodes(
      queuePoint,
      newState
    );
    _.forEach(neighboursOfQueueCoordinate, function(neighbour) {
      if (neighbour) {
        direction = getDirection(neighbour.coordinate, queuePoint);
        if (neighbour.neighbours[direction][0] == !0) {
          neighbour.neighbours[direction] = [1, 1, 1];
        }
        // Update queuePoint's movement in opp direction.
        if (newState[queuePoint].neighbours[(direction + 2) % 4][0] == 1) {
          newState[queuePoint].neighbours[(direction + 2) % 4] = [1, 1, 1];
        }
      }
    });
  });
  return newState;
};

const deleteElevator = (state, action) => {
  let newState = _.clone(state);
  const { coordinates_list } = action.value;
  _.forEach(coordinates_list, function(coordinate) {
    // Replace coordinate value to its original barcode value.
    newState[coordinate].barcode = implicitCoordinateKeyToBarcode(coordinate);
  });
  return newState;
};

export { deleteChargerData, deletePPSQueue, deleteElevator };
