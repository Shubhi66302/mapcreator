// action creator to make clicked-on-tile action from clicked-on-viewport action
import { handleErrors } from "utils/util";
import {
  worldToTileCoordinate,
  getTileIdToWorldCoordMapFunc,
  tileIdsMapSelector,
  getDragSelectedTiles,
  distanceTileSpritesSelector,
  coordinateKeyToBarcodeSelector
} from "utils/selectors";
import { denormalizeMap } from "utils/normalizr";
import { loader as PIXILoader } from "pixi.js";
import JSZip from "jszip";
import { saveAs } from "file-saver/FileSaver";
import exportMap from "common/utils/export-map";
import { SPRITESHEET_PATH } from "../constants";
import { fitToViewport, setViewportClamp } from "./viewport";
import _ from "lodash";
import { setErrorMessage, setSuccessMessage } from "./message";
import {
  getMap,
  updateMap,
  createMap,
  deleteMap as deleteMapApi
} from "utils/api";

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
  const distanceTileRects = distanceTileSpritesSelector(state);
  const isPointOnADistanceTile = distanceTileRects.some(rect =>
    isPointInRect(rect, worldCoordinate)
  );
  var tileId = worldToTileCoordinate(state, worldCoordinate);
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

export const dragEnd = () => (dispatch, getState) => {
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
  PIXILoader.add("mySpritesheet", SPRITESHEET_PATH).load(() => {
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

export const fetchMap = mapId => dispatch => {
  dispatch(clearMap);
  return getMap(mapId)
    .then(handleErrors)
    .then(res => res.json())
    .then(map => dispatch(newMap(map)))
    .then(() => dispatch(setViewportClamp))
    .then(() => dispatch(fitToViewport))
    .catch(error => console.warn(error)); // eslint-disable-line no-console
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

// If all selections are storable -> converted to non-storable
// If all/some selections are non-storable -> converted to storable
export const toggleStorable = () => (dispatch, getState) => {
  const state = getState();
  const {
    selection: { mapTiles }
  } = state;
  const selectedTiles = Object.keys(mapTiles);
  var allStorable = _.every(selectedTiles, function(coordinate) {
    return state.normalizedMap.entities.barcode[coordinate].store_status == 1;
  });
  if (allStorable == true) {
    dispatch({
      type: "TOGGLE-STORABLE",
      value: { selectedTiles, makeStorable: 0 }
    });
  } else {
    dispatch({
      type: "TOGGLE-STORABLE",
      value: { selectedTiles, makeStorable: 1 }
    });
  }
  return dispatch(clearTiles);
};

export const addQueueBarcodes = () => (dispatch, getState) => {
  const state = getState();
  const {
    selection: { mapTiles },
    normalizedMap: {
      entities: { pps }
    }
  } = state;

  var ppscoordiantes = _.map(pps, "coordinate");
  var queuebarcodes = _.keys(mapTiles);
  var intersectionresult = ppscoordiantes.filter(
    value => -1 !== queuebarcodes.indexOf(value)
  );

  if (intersectionresult.length == 1) {
    var pps_id = _.findKey(pps, { coordinate: intersectionresult[0] });

    var queue_barcodes_array = Object.keys(mapTiles).sort(function(a, b) {
      return mapTiles[a] - mapTiles[b];
    });
    var asBarcodes = queue_barcodes_array.map(asCoordinate =>
      coordinateKeyToBarcodeSelector(state, { tileId: asCoordinate })
    );
    dispatch({
      type: "ADD-QUEUE-BARCODES-TO-PPS",
      value: {
        tiles: asBarcodes,
        pps_id: pps_id,
        coordinates: queue_barcodes_array,
        pps_coordinate: pps[pps_id].coordinate
      }
    });
  }

  return dispatch(clearTiles);
};

export const addWorldCoordinateToMap = normalizedMap => {
  var entities = normalizedMap.entities;
  const oldBarcodeDict = entities.barcode;
  const floorInfo = entities.floor;
  var newbarcodeDict = {};
  for (var floorId in floorInfo) {
    var currentFloorBarcodeDict = {};
    const barcodeKeys = floorInfo[floorId].map_values;
    barcodeKeys.forEach(barcodeKey => {
      currentFloorBarcodeDict[barcodeKey] = oldBarcodeDict[barcodeKey];
    });
    const tileToWorldCoordinateMap = getTileIdToWorldCoordMapFunc(
      currentFloorBarcodeDict
    );
    for (var barcode in currentFloorBarcodeDict) {
      var barcodeInfo = currentFloorBarcodeDict[barcode];
      const worldCoordinate = tileToWorldCoordinateMap[barcode];
      barcodeInfo["world_coordinate"] = `[${worldCoordinate.x},${
        worldCoordinate.y
      }]`;
      currentFloorBarcodeDict[barcode] = barcodeInfo;
    }
    newbarcodeDict = { ...newbarcodeDict, ...currentFloorBarcodeDict };
  }
  entities.barcode = newbarcodeDict;
  normalizedMap.entities = entities;
  return normalizedMap;
};

export const saveMap = (onError, onSuccess) => (dispatch, getState) => {
  const { normalizedMap } = getState();
  // denormalize it
  const mapObj = denormalizeMap(normalizedMap);
  return updateMap(mapObj.id, mapObj.map)
    .then(handleErrors)
    .then(res => res.json())
    .then(map => dispatch(newMap(map)))
    .then(onSuccess)
    .catch(onError);
};

export const downloadMap = (singleFloor = false) => (dispatch, getState) => {
  var { normalizedMap } = getState();
  normalizedMap = addWorldCoordinateToMap(normalizedMap);
  // denormalize it
  const mapObj = denormalizeMap(normalizedMap);
  const exportedJson = exportMap(mapObj.map, singleFloor);
  var zip = new JSZip();
  Object.keys(exportedJson).forEach(fileName => {
    zip.file(`${fileName}.json`, JSON.stringify(exportedJson[fileName]));
  });
  return zip.generateAsync({ type: "blob" }).then(content => {
    saveAs(content, mapObj.id + ".zip");
  });
};

export const editSpecialBarcode = ({ coordinate, new_barcode }) => ({
  type: "EDIT-BARCODE",
  value: { coordinate, new_barcode }
});

export const createMapCopy = ({ name }) => (dispatch, getState) => {
  const state = getState();
  return createMap(denormalizeMap(state.normalizedMap).map, name)
    .then(handleErrors)
    .then(res => res.json())
    .then(id =>
      dispatch(setSuccessMessage(`Created new map '${name}' with ID #${id}`))
    )
    .catch(error => dispatch(setErrorMessage(error)));
};

export const deleteMap = (id, history) => dispatch => {
  return deleteMapApi(id)
    .then(handleErrors)
    .then(() => history.push("/"))
    .catch(error => dispatch(setErrorMessage(error)));
};
