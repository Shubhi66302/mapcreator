import { getIdsForEntities } from "utils/util";
import { addEntitiesToFloor, clearTiles } from "./actions";
import { coordinateKeyToBarcodeSelector } from "utils/selectors";
import _ from "lodash";

// exported for testing
export const createNewPPSes = ({ pick_direction }, state) => {
  const { selectedTiles } = state;
  var ppses = Object.keys(selectedTiles).map(tileId => {
    const barcode = coordinateKeyToBarcodeSelector(state, { tileId });
    return {
      coordinate: tileId,
      location: barcode,
      status: "disconnected",
      queue_barcodes: [],
      pick_position: barcode,
      pick_direction,
      put_docking_positions: [],
      allowed_modes: ["put", "pick", "audit"]
    };
  });
  return ppses;
};

export const addPPSes = formData => (dispatch, getState) => {
  const state = getState();
  const { currentFloor } = state;
  const ppses = createNewPPSes(formData, state);
  dispatch({
    type: "ADD-MULTIPLE-PPS",
    value: ppses
  });
  dispatch(
    addEntitiesToFloor({
      currentFloor,
      floorKey: "ppses",
      entities: ppses,
      idField: "pps_id"
    })
  );
  dispatch(clearTiles);
  return Promise.resolve();
};
