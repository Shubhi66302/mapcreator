import { addEntitiesToFloor, clearTiles } from "./actions";
import {
  coordinateKeyToBarcodeSelector,
  getIdsForNewEntities
} from "utils/selectors";
import _ from "lodash";

// exported for testing
export const createNewFireEmergencies = ({ group_id, type }, state) => {
  const {
    selection: { mapTiles }
  } = state;
  var fireEmergencies = Object.keys(mapTiles).map(tileId => {
    const barcode = coordinateKeyToBarcodeSelector(state, { tileId });
    return {
      coordinate: tileId,
      type,
      group_id,
      priority: type == "shutter" ? "0" : "1",
      barcode
    };
  });
  var ids = getIdsForNewEntities(state, {
    entityName: "fireEmergency",
    newEntities: fireEmergencies
  });
  return _.zip(ids, fireEmergencies).map(
    ([fire_emergency_id, fireEmergency]) => ({
      ...fireEmergency,
      fire_emergency_id
    })
  );
};

export const addFireEmergencies = formData => (dispatch, getState) => {
  const state = getState();
  const { currentFloor } = state;
  const fireEmergencies = createNewFireEmergencies(formData, state);
  dispatch({
    type: "ADD-MULTIPLE-FIRE-EMERGENCY",
    value: fireEmergencies
  });
  dispatch(
    addEntitiesToFloor({
      currentFloor,
      floorKey: "fireEmergencies",
      entities: fireEmergencies,
      idField: "fire_emergency_id"
    })
  );
  dispatch(clearTiles);
  return Promise.resolve();
};
