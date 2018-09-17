import { getIdsForEntities, coordinateKeyToBarcode } from "utils/util";
import { addEntitiesToFloor, clearTiles } from "./actions";
import _ from "lodash";

// exported for testing
export const createNewPPSes = ({ pick_direction }, state) => {
  const { selectedTiles, currentFloor } = state;
  const existingPPSes = state.normalizedMap.entities["pps"] || {};
  const numEntities = Object.keys(selectedTiles).length;
  var pps_ids = getIdsForEntities(numEntities, existingPPSes);
  var ppses = _.unzip([pps_ids, Object.keys(selectedTiles)]).map(
    ([pps_id, tileId]) => {
      const barcode = coordinateKeyToBarcode(tileId);
      return {
        pps_id,
        location: barcode,
        status: "disconnected",
        queue_barcodes: [],
        pick_position: barcode,
        pick_direction,
        pps_url: `http://localhost:8181/pps/${pps_id}/api/`,
        put_docking_positions: [],
        // default value for allowed_modes
        allowed_modes: ["put", "pick", "audit"]
      };
    }
  );
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
