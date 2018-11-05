// action creator to make clicked-on-tile action from clicked-on-viewport action
import { worldToTileCoordinate, handleErrors } from "utils/util";
import {
  tileBoundsSelector,
  tileIdsMapSelector,
  getDragSelectedTiles,
  distanceTileSpritesSelector
} from "utils/selectors";
import { denormalizeMap } from "utils/normalizr";
import { loader as PIXILoader } from "pixi.js";
import JSZip from "jszip";
import { saveAs } from "file-saver/FileSaver";
import exportMap from "common/utils/export-map";
import { SPRITESHEET_PATH } from "../constants";
import { fitToViewport, setViewportClamp } from "./viewport";
// always good idea to return promises from async action creators

export const mapTileClick = tileId => ({
  type: "CLICK-ON-MAP-TILE",
  value: tileId
});
export const outsideTilesClick = {
  type: "CLICK-OUTSIDE-TILES"
};

const isPointInRect = ({ x, y, width, height }, { x: px, y: py }) =>
  px >= x && px <= x + width && py >= y && py <= y + height;

export const clickOnViewport = (worldCoordinate, onShiftClickOnMapTile) => (
  dispatch,
  getState
) => {
  const state = getState();
  const tileIdsMap = tileIdsMapSelector(state);
  const tileBounds = tileBoundsSelector(state);
  const distanceTileRects = distanceTileSpritesSelector(state);
  const isPointOnADistanceTile = distanceTileRects.some(rect =>
    isPointInRect(rect, worldCoordinate)
  );
  var tileId = worldToTileCoordinate(worldCoordinate, tileBounds);
  // make sure the tileId is actually part of current floor's tiles
  if (tileId && tileIdsMap[tileId]) {
    if (state.selection.shiftKey) return onShiftClickOnMapTile(tileId);
    return dispatch(mapTileClick(tileId));
  } else if (!isPointOnADistanceTile) {
    return dispatch(outsideTilesClick);
  } else {
    return Promise.resolve();
  }
};

export const clickOnDistanceTile = distanceTileKey => ({
  type: "CLICK-ON-DISTANCE-TILE",
  value: distanceTileKey
});

export const dragStart = worldCoordinate => (dispatch, getState) => {
  const { selectedArea } = getState();
  if (!selectedArea) {
    // drag not already started
    dispatch({
      type: "DRAG-START",
      value: worldCoordinate
    });
  }
  return Promise.resolve();
};

export const dragEnd = worldCoordinate => (dispatch, getState) => {
  const state = getState();
  if (state.selectedArea) {
    dispatch({
      type: "DRAG-END",
      value: getDragSelectedTiles(state)
    });
  }
  return Promise.resolve();
};

export const dragMove = worldCoordinate => ({
  type: "DRAG-MOVE",
  value: worldCoordinate
});

const newSpritesheet = {
  type: "LOADED-SPRITESHEET"
};

export const loadSpritesheet = () => dispatch => {
  PIXILoader.add("mySpritesheet", SPRITESHEET_PATH).load((loader, resource) => {
    dispatch(newSpritesheet);
  });
  return Promise.resolve();
};

export const newMap = map => ({
  type: "NEW-MAP",
  value: map
});

export const clearMap = {
  type: "CLEAR-MAP"
};

export const fetchMap = mapId => (dispatch, getState) => {
  dispatch(clearMap);
  return fetch(`/api/map/${mapId}`)
    .then(handleErrors)
    .then(res => res.json())
    .then(map => dispatch(newMap(map)))
    .then(() => dispatch(setViewportClamp))
    .then(() => dispatch(fitToViewport))
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
  const {
    selection: { mapTiles }
  } = getState();
  dispatch({
    type: "ASSIGN-STORABLE",
    value: mapTiles
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
