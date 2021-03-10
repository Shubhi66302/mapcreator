import { clearTiles } from "./actions";

export const addSector = ({ sector_id }) => ({
  type: "ADD-SECTOR",
  value: {
    blocked: false,
    paused: false,
    sector_id
  }
});

export const assignSector = ({ sector_id }) => (dispatch, getState) => {
  const {
    selection: { mapTiles }
  } = getState();
  dispatch({
    type: "ASSIGN-SECTOR",
    value: {
      sector_id,
      mapTiles
    }
  });
  dispatch(clearTiles);
};
