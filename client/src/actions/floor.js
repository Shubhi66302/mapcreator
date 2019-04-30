import { createFloorFromCoordinateData } from "utils/util";
import { getBarcodes } from "utils/selectors";
import _ from "lodash";
import { setErrorMessage } from "./message";

export const addFloor = ({
  floor_id,
  row_start,
  row_end,
  column_start,
  column_end
}) => (dispatch, getState) => {
  var floorData = createFloorFromCoordinateData({
    floor_id,
    row_start,
    row_end,
    column_start,
    column_end
  });
  var barcodes = getBarcodes(getState());
  // show error if a barcode already exists
  var intersection = _.intersection(
    Object.keys(barcodes),
    floorData.map_values.map(barcode => barcode.coordinate)
  );
  if (intersection.length) {
    return dispatch(setErrorMessage("Existing barcodes detected in range."));
  }
  return dispatch({
    type: "ADD-FLOOR",
    value: floorData
  });
};
