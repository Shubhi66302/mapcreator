// action creator to make clicked-on-tile action from clicked-on-viewport action
import { worldToTileCoordinate, handleErrors } from "utils/util";
// TODO: should probably check if click is on sprite or not.
export const clickOnViewport = (worldCoordinate, tileBounds) => ({
  type: "CLICK-ON-TILE",
  value: worldToTileCoordinate(worldCoordinate, tileBounds)
});

export const changeRandomSprite = () => ({
  type: "CHANGE-RANDOM-SPRITE",
  value: `${Math.floor(Math.random() * 10)}.png`
});

const newMap = map => ({
  type: "NEW-MAP",
  value: map
});

// HACK: fetching from main app endpoint
export const fetchMap = mapId => dispatch => {
  fetch(`http://localhost:3001/api/map/${mapId}`)
    .then(handleErrors)
    .then(res => res.json())
    .then(map => dispatch(newMap(map)))
    .catch(error => console.log(error));
};

// HACK: dummy pps adder
export const addPPS = barcodeString => ({
  type: "ADD-PPS",
  value: {
    location: barcodeString,
    pick_direction: 0,
    allowed_modes: ["put", "pick", "audit"],
    pick_position: barcodeString,
    status: "disconnected",
    put_docking_positions: [],
    pps_url: "http://localhost:8181/pps/1/api/",
    queue_barcodes: []
  }
});
