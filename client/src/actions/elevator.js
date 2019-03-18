import { coordinateKeyToTupleOfIntegers } from "utils/util";
import { tupleOfIntegersToCoordinateKey } from "../utils/util";
import _ from "lodash";

export const addElevator = ({ coordinate_list, ...rest }) => ({
  type: "ADD-ELEVATOR",
  value: {
    ...rest,
    entry_barcodes: [],
    reinit_barcodes: [],
    exit_barcodes: [],
    // hardcoded direction as per heena
    coordinate_list: coordinate_list.map(coordinateKey => ({
      coordinate: coordinateKeyToTupleOfIntegers(coordinateKey),
      direction: 2
    }))
  }
});

const convertFloorIdToInt = entryOrExitBarcodes =>
  entryOrExitBarcodes.map(({ floor_id, ...rest }) => ({
    ...rest,
    floor_id: parseInt(floor_id)
  }));

export const editEntryPoints = ({ entry_barcodes, elevator_id }) => ({
  type: "EDIT-ELEVATOR-ENTRY-POINTS",
  value: {
    elevator_id,
    entry_barcodes: convertFloorIdToInt(entry_barcodes)
  }
});

export const editExitPoints = ({ exit_barcodes, elevator_id }) => ({
  type: "EDIT-ELEVATOR-EXIT-POINTS",
  value: {
    elevator_id,
    exit_barcodes: convertFloorIdToInt(exit_barcodes)
  }
});

export const editElevatorCoordinates = ({ elevator_id, coordinate_list }) => (
  dispatch,
  getState
) => {
  // need old coordinate list as well to revert their barcodes..
  // also need elevator's position
  const oldElevator = getState().normalizedMap.entities.elevator[elevator_id];
  const old_coordinate_list = oldElevator ? oldElevator.coordinate_list : [];
  const elevator_position = oldElevator ? oldElevator.position : "noelevator"; // what to do if it doesn't exist?
  return dispatch({
    type: "EDIT-ELEVATOR-COORDINATES",
    value: {
      elevator_id,
      old_coordinate_list,
      elevator_position,
      coordinate_list: coordinate_list.map(({ coordinate, direction }) => ({
        // convert string to tuple (which will happen when entering throughf orm)
        coordinate:
          typeof coordinate == "string"
            ? coordinateKeyToTupleOfIntegers(coordinate)
            : coordinate,
        direction: parseInt(direction)
      }))
    }
  });
};

export const removeElevator = ({ elevator_id }) => (dispatch, getState) =>
{
  const state = getState().normalizedMap.entities.elevator[elevator_id].coordinate_list;
  const coordinates_list = _.map(state, function (coordinate) {
    return tupleOfIntegersToCoordinateKey(coordinate.coordinate);
  });
  dispatch({
    type: "DELETE-ELEVATOR",
    value: {elevator_id, coordinates_list}
  });
};