// using reselect for memoization
import { createSelector } from "reselect";
import {
  getBarcodeSize,
  getCurrentFloorBarcodeIds,
  getBarcodes
} from "./barcode-selectors";
import { intersectRect } from "../util";
import {
  getTileIdToWorldCoordMap,
  tileToWorldCoordinate
} from "./world-coordinate-utils-selectors";
import {
  distanceTileSpritesSelector,
  getDistinctXAndYDistances
} from "./distance-tile-selectors";
import { getParticularEntity } from "./map-tile-selectors";

import _ from "lodash";
import * as constants from "../../constants";

export {
  getCurrentFloorBarcodeIds,
  getBarcodes,
  getBarcode,
  getCurrentFloorBarcodes,
  coordinateKeyToBarcodeSelector,
  currentFloorBarcodeToCoordinateMap,
  currentFloorBarcodeToCoordinateKeySelector
} from "./barcode-selectors";

export {
  getTileSpriteScale,
  tileRenderCoordinateSelector,
  spriteRenderCoordinateSelector
} from "./map-render-selectors";

export {
  getTileIdToWorldCoordMapFunc,
  getTileIdToWorldCoordMap,
  tileToWorldCoordinate,
  worldToTileCoordinate
} from "./world-coordinate-utils-selectors";

export {
  getDistinctXAndYDistances,
  distanceTileSpritesSelector,
  getRowColumnInBetweenDistancesAndCoordinates,
  getTileIdsForDistanceTiles
} from "./distance-tile-selectors";

export {
  tileNameWithoutEntityDataSelector,
  tileSpriteNamesWithoutEntityData,
  getParticularEntity,
  specialTileSpritesMapSelector
} from "./map-tile-selectors";

// just a map of tileIds instead of array. useful to key if tileId is good or not
export const tileIdsMapSelector = createSelector(
  getCurrentFloorBarcodeIds,
  tileIds => {
    var ret = {};
    for (var tileId of tileIds) {
      ret[tileId] = true;
    }
    return ret;
  }
);

export const getFitToSizeViewportRect = createSelector(
  getDistinctXAndYDistances,
  distinctXAndYDistances => {
    const distinctXDistances = distinctXAndYDistances.x;
    const distinctYDistances = distinctXAndYDistances.y;
    const left = distinctXDistances[distinctXDistances.length - 1];
    const right = distinctXDistances[0];
    const bottom = distinctYDistances[distinctYDistances.length - 1];
    const top = distinctYDistances[0];
    var xPadding = (right - left) * constants.VIEWPORT_MAX_SIZE_PADDING_RATIO;
    var yPadding = (bottom - top) * constants.VIEWPORT_MAX_SIZE_PADDING_RATIO;
    return {
      top: top - yPadding,
      bottom: bottom + yPadding,
      left: left - xPadding,
      right: right + xPadding
    };
  }
);

export const getIdsForNewEntities = createSelector(
  getParticularEntity,
  (_state, { newEntities, uniqueKey = "coordinate" }) => [
    newEntities,
    uniqueKey
  ],
  (entitiesObj, [newEntities, uniqueKey]) => {
    var nextId =
      Object.keys(entitiesObj).reduce((prev, key) => Math.max(prev, key), 0) +
      1;
    // entity already exists if coordinate is same as of an existing entity. so return old id only
    return newEntities.map(
      entity =>
        parseInt(_.findKey(entitiesObj, { [uniqueKey]: entity[uniqueKey] })) ||
        nextId++
    );
  }
);

export const getRectFromDiagonalPoints = ({ startPoint, endPoint }) => ({
  left: Math.min(startPoint.x, endPoint.x),
  right: Math.max(startPoint.x, endPoint.x),
  top: Math.min(startPoint.y, endPoint.y),
  bottom: Math.max(startPoint.y, endPoint.y)
});

export const getDragSelectedTiles = createSelector(
  getCurrentFloorBarcodeIds,
  getTileIdToWorldCoordMap,
  distanceTileSpritesSelector,
  state => state.selectedArea,
  state => state,
  (
    tileIds,
    tileIdToWorldCoordinateMap,
    distanceTileRects,
    selectedArea,
    state
  ) => {
    if (!selectedArea) return [];
    const selectionRect = getRectFromDiagonalPoints(selectedArea);
    const selectedMapTiles = tileIds.filter(tileId => {
      const worldXCoordinate = tileToWorldCoordinate(
        tileId,
        tileIdToWorldCoordinateMap
      );
      const barcodeSizeInfo = getBarcodeSize(state, { tileId });
      const defDistance = constants.DEFAULT_DISTANCE_BW_BARCODES;
      const topLeftPointX =
        worldXCoordinate.x -
        (barcodeSizeInfo[3] * (defDistance - constants.BARCODE_SPRITE_GAP)) /
          defDistance;
      const topRightPointX =
        worldXCoordinate.x +
        (barcodeSizeInfo[1] * (defDistance - constants.BARCODE_SPRITE_GAP)) /
          defDistance;
      const topLeftPointY =
        worldXCoordinate.y -
        (barcodeSizeInfo[0] * (defDistance - constants.BARCODE_SPRITE_GAP)) /
          defDistance;
      const bottomLeftPointY =
        worldXCoordinate.y +
        (barcodeSizeInfo[2] * (defDistance - constants.BARCODE_SPRITE_GAP)) /
          defDistance;
      var rect = {
        left: topLeftPointX,
        right: topRightPointX,
        top: topLeftPointY,
        bottom: bottomLeftPointY
      };
      return intersectRect(selectionRect, rect);
    });
    const selectedDistanceTiles = distanceTileRects
      .filter(({ x, y, width, height }) =>
        intersectRect(selectionRect, {
          left: x,
          right: x + width,
          top: y,
          bottom: y + height
        })
      )
      .map(({ key }) => key);
    return {
      mapTilesArr: selectedMapTiles,
      distanceTilesArr: selectedDistanceTiles
    };
  }
);

// all floors considered
export const specialBarcodesCoordinateSelector = createSelector(
  getBarcodes,
  barcodes =>
    Object.keys(barcodes).filter(coordinate => barcodes[coordinate].special)
);

export const specialBarcodesSelector = createSelector(
  specialBarcodesCoordinateSelector,
  getBarcodes,
  (specialBarcodesCoordinates, barcodes) =>
    specialBarcodesCoordinates.map(coordinate => barcodes[coordinate])
);

// initializes with 500,500 for first special barcode
export const getNewSpecialCoordinates = createSelector(
  specialBarcodesCoordinateSelector,
  (_state, { n }) => n,
  (coordinateKeys, n) => {
    const existingSet = new Set(coordinateKeys);
    // iterate starting from 500,500 and just see if it already exists, otherwise add to result
    var ret = [];
    // start from 500,500
    var currentX = 500;
    while (ret.length < n) {
      var candidate = `${currentX},${currentX}`;
      if (!existingSet.has(candidate)) {
        ret.push(candidate);
      }
      currentX += 1;
    }
    // hopefully won't get stuck in above loop...
    return ret;
  }
);

export const getStorableCoordinatesCount = createSelector(
  getBarcodes,
  barcodesDict =>
    Object.values(barcodesDict).filter(({ store_status }) => store_status)
      .length
);

export const getElevatorIds = state =>
  state.normalizedMap.entities.map.dummy.elevators;

export const getMapId = state =>
  Object.values(state.normalizedMap.entities.mapObj)[0].id;

export const getMapName = state =>
  Object.values(state.normalizedMap.entities.mapObj)[0].name;
