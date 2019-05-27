import { addEntitiesToFloor, clearTiles } from "./actions";
import {
  coordinateKeyToBarcodeSelector,
  getIdsForNewEntities
} from "utils/selectors";
import _ from "lodash";
import {implicitBarcodeToCoordinate} from "utils/util";

// exported for testing
export const createNewPPSes = ({ pick_direction, type }, state) => {
  const {
    selection: { mapTiles }
  } = state;
  var ppses = Object.keys(mapTiles).map(tileId => {
    const barcode = coordinateKeyToBarcodeSelector(state, { tileId });
    return {
      coordinate: tileId,
      location: barcode,
      status: "disconnected",
      queue_barcodes: [],
      pick_position: barcode,
      pick_direction,
      put_docking_positions: [],
      allowed_modes: ["put", "pick", "audit"],
      type
    };
  });
  var ids = getIdsForNewEntities(state, {
    entityName: "pps",
    newEntities: ppses
  });
  return _.zip(ids, ppses).map(([pps_id, pps]) => ({
    ...pps,
    pps_id,
    pps_url: `http://localhost:8181/pps/${pps_id}/api/`
  }));
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

export const removePpsQueue = ({pps_id}) => (dispatch, getState) => {
  const state = getState();
  const queue_barcodes = state.normalizedMap.entities.pps[pps_id].queue_barcodes;
  if (queue_barcodes == []) {
    return Promise.resolve();
  }
  const queue_coordinates = _.map(queue_barcodes, function (barcode) {
    return implicitBarcodeToCoordinate(barcode);
  });
  dispatch({
    type: "DELETE-PPS-QUEUE",
    value: {pps_id, queue_coordinates}
  });
};

export const removePps = ({ pps_id}) => (dispatch, getState) => { 
  const state = getState();
  const queue_barcodes = state.normalizedMap.entities.pps[pps_id].queue_barcodes;
  if (queue_barcodes) {
    const queue_coordinates = _.map(queue_barcodes, function (barcode) {
      return implicitBarcodeToCoordinate(barcode);
    });
    dispatch({
      type: "DELETE-PPS-QUEUE",
      value: {pps_id, queue_coordinates}
    });
  }
  dispatch({
    type: "DELETE-PPS-BY-ID",
    value: pps_id
  });
};