import { clearTiles } from "./actions";

export const sectorMxUPreferences = (formData) => (dispatch, getState) => {
  const {
    normalizedMap: { entities }
  } = getState();
  dispatch({
    type: "SECTOR-MXU-PREFERENCES",
    value: {formData, entities}
  });
  dispatch(clearTiles);
};