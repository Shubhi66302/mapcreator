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
