// action creator to make clicked-on-tile action from clicked-on-viewport action
import { worldToTileCoordinate, handleErrors } from "utils/util";
import { tileBoundsSelector, tileIdsMapSelector } from "utils/selectors";
import { denormalizeMap } from "utils/normalizr";
import { loader as PIXILoader } from "pixi.js";
import JSZip from "jszip";
import { saveAs } from "file-saver/FileSaver";
import exportMap from "common/utils/export-map";
import { SPRITESHEET_PATH } from "../constants";
// always good idea to return promises from async action creators

export const tileClick = tileId => ({
  type: "CLICK-ON-TILE",
  value: tileId
});
export const outsideTileClick = {
  type: "CLICK-OUTSIDE-TILES"
};

// TODO: should probably check if click is on sprite or not.
export const clickOnViewport = worldCoordinate => (dispatch, getState) => {
  const state = getState();
  const tileIdsMap = tileIdsMapSelector(state);
  const tileBounds = tileBoundsSelector(state);
  var tileId = worldToTileCoordinate(worldCoordinate, tileBounds);
  // make sure the tileId is actually part of current floor's tiles
  if (tileId && tileIdsMap[tileId]) {
    return dispatch(tileClick(tileId));
  } else {
    return dispatch(outsideTileClick);
  }
};

const newSpritesheet = {
  type: "LOADED-SPRITESHEET"
};

export const loadSpritesheet = () => dispatch => {
  PIXILoader.add("mySpritesheet", SPRITESHEET_PATH).load((loader, resource) => {
    dispatch(newSpritesheet);
  });
};

export const newMap = map => ({
  type: "NEW-MAP",
  value: map
});

export const clearMap = {
  type: "CLEAR-MAP"
};

export const fetchMap = mapId => dispatch => {
  dispatch(clearMap);
  return fetch(`/api/map/${mapId}`)
    .then(handleErrors)
    .then(res => res.json())
    .then(map => dispatch(newMap(map)))
    .catch(error => console.warn(error));
};

export const clearTiles = {
  type: "CLEAR-SELECTED-TILES"
};

// TODO: figure out if this can be done
// export const addToEntitiesAndFloor = ({
//   currentFloor, floorKey, entitiesKey, reducerKey, idField, entities
// }) => (dispatch, getState) => {
//   // dispatch both ADD-MULTIPLE-{reducerKey} and ADD-ENTITIES-TO-FLOOR
// }

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

export const assignStorable = () => (dispatch, getState) => {
  const { selectedTiles } = getState();
  dispatch({
    type: "ASSIGN-STORABLE",
    value: selectedTiles
  });
  return dispatch(clearTiles);
};

export const saveMap = (onError, onSuccess) => (dispatch, getState) => {
  const { normalizedMap } = getState();
  // denormalize it
  const mapObj = denormalizeMap(normalizedMap);
  return fetch(`/api/map/${mapObj.id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      map: mapObj.map
    })
  })
    .then(handleErrors)
    .then(res => res.json())
    .then(map => dispatch(newMap(map)))
    .then(onSuccess)
    .catch(onError);
};

export const downloadMap = () => (dispatch, getState) => {
  const { normalizedMap } = getState();
  // denormalize it
  const mapObj = denormalizeMap(normalizedMap);
  const exportedJson = exportMap(mapObj.map);
  var zip = new JSZip();
  Object.keys(exportedJson).forEach(fileName => {
    zip.file(`${fileName}.json`, JSON.stringify(exportedJson[fileName]));
  });
  return zip.generateAsync({ type: "blob" }).then(content => {
    saveAs(content, mapObj.id + ".zip");
  });
};
