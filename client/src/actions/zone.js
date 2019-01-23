import { clearTiles } from "./actions";

export const addZone = ({ zone_id }) => ({
  type: "ADD-ZONE",
  value: {
    blocked: false,
    paused: false,
    zone_id
  }
});

export const assignZone = ({ zone_id }) => (dispatch, getState) => {
  const {
    selection: { mapTiles }
  } = getState();
  dispatch({
    type: "ASSIGN-ZONE",
    value: {
      zone_id,
      mapTiles
    }
  });
  dispatch(clearTiles);
};
