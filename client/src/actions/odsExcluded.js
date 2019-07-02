import { addEntitiesToFloor, clearTiles } from "./actions";
import {
  coordinateKeyToBarcodeSelector,
  getIdsForNewEntities
} from "utils/selectors";
import _ from "lodash";

// exported for testing
export const createNewOdsExcluded = ({ direction }, state) => {
  const {
    selection: { mapTiles }
  } = state;
  var odsExcluded = Object.keys(mapTiles).map(tileId => {
    const barcode = coordinateKeyToBarcodeSelector(state, { tileId });
    return {
      coordinate: tileId,
      excluded: true,
      ods_tuple: `${barcode}--${direction}`
    };
  });
  var ids = getIdsForNewEntities(state, {
    entityName: "odsExcluded",
    newEntities: odsExcluded,
    uniqueKey: "ods_tuple"
  });
  return _.zip(ids, odsExcluded).map(([ods_excluded_id, odsExcluded]) => ({
    ...odsExcluded,
    ods_excluded_id
  }));
};

export const addOdsExcludeds = formData => (dispatch, getState) => {
  const state = getState();
  const { currentFloor } = state;
  const odsExcluded = createNewOdsExcluded(formData, state);
  dispatch({
    type: "ADD-MULTIPLE-ODS-EXCLUDED",
    value: odsExcluded
  });
  dispatch(
    addEntitiesToFloor({
      currentFloor,
      floorKey: "odsExcludeds",
      entities: odsExcluded,
      idField: "ods_excluded_id"
    })
  );
  dispatch(clearTiles);
  return Promise.resolve();
};
