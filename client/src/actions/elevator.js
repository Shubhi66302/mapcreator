import { clearTiles } from "./actions";
import { coordinateKeyToTupleOfIntegers } from "utils/util";

export const addElevator = ({ coordinate_list, ...rest }) => dispatch => {
  dispatch({
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
  dispatch(clearTiles);
};

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

export const editElevatorCoordinates = ({ elevator_id, coordinate_list }) => ({
  type: "EDIT-ELEVATOR-COORDINATES",
  value: {
    elevator_id,
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
