// action creator to make clicked-on-tile action from clicked-on-viewport action
import { worldToTileCoordinate, handleErrors } from "utils/util";
import * as PIXI from "pixi.js";

// TODO: should probably check if click is on sprite or not.
export const clickOnViewport = (worldCoordinate, tileBounds) => ({
  type: "CLICK-ON-TILE",
  value: worldToTileCoordinate(worldCoordinate, tileBounds)
});

const newSpritesheet = {
  type: "LOADED-SPRITESHEET"
};

export const loadSpritesheet = () => dispatch => {
  PIXI.loader
    .add("mySpritesheet", `${process.env.PUBLIC_URL}/arial-bitmap-sparrow.json`)
    .load((loader, resource) => {
      dispatch(newSpritesheet);
    });
};

const newMap = map => ({
  type: "NEW-MAP",
  value: map
});

const clearMap = {
  type: "CLEAR-MAP"
};

export const fetchMap = mapId => dispatch => {
  dispatch(clearMap);
  fetch(`/api/map/${mapId}`)
    .then(handleErrors)
    .then(res => res.json())
    .then(map => dispatch(newMap(map)))
    .catch(error => console.log(error));
};

export const clearTiles = () => ({
  type: "CLEAR-SELECTED-TILES"
});

export const addEntitiesToFloor = ({
  currentFloor,
  floorKey,
  entities,
  idField
}) => ({
  type: "ADD-ENTITIES-TO-FLOOR",
  value: {
    currentFloor,
    floorKey,
    ids: entities.map(e => e[idField])
  }
});

// eg. ('PPS', 'pps', 'ppses', 'pps_id', fn)
export const addEntities = ({
  reducerKey,
  entityKey,
  floorKey,
  idField,
  createEntities
}) => (dispatch, getState) => {
  var state = getState();
  const { selectedTiles, currentFloor } = state;
  const existingEntities = state.normalizedMap.entities[entityKey] || {};
  var newEntities = createEntities(selectedTiles, existingEntities);
  dispatch({
    type: `ADD-MULTIPLE-${reducerKey}`,
    value: newEntities
  });
  dispatch(clearTiles());
  dispatch(
    addEntitiesToFloor({
      currentFloor,
      floorKey,
      entities: newEntities,
      idField
    })
  );
};

export const assignStorable = () => (dispatch, getState) => {
  const { selectedTiles } = getState();
  dispatch({
    type: "ASSIGN-STORABLE",
    value: selectedTiles
  });
  dispatch(clearTiles());
};

//
// // HACK: dummy pps adder
// export const addPPS = barcodeString => ({
//   type: "ADD-PPS",
//   value: {
//     location: barcodeString,
//     pick_direction: 0,
//     allowed_modes: ["put", "pick", "audit"],
//     pick_position: barcodeString,
//     status: "disconnected",
//     put_docking_positions: [],
//     pps_url: "http://localhost:8181/pps/1/api/",
//     queue_barcodes: []
//   }
// });
