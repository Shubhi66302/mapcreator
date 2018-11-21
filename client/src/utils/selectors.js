// using reselect for memoization
// mainly selectors for map rendering
import { createSelector } from "reselect";
import createCachedSelector from "re-reselect";
import {
  coordinateKeyToTupleOfIntegers,
  tupleOfIntegersToCoordinateKey,
  tileToWorldCoordinate,
  getNeighbouringBarcodes,
  intersectRect
} from "./util";
import _ from "lodash";
import * as constants from "../constants";

const getCurrentFloorBarcodeIds = state =>
  state.normalizedMap.entities.floor[state.currentFloor].map_values;
export const getBarcodes = state => state.normalizedMap.entities.barcode || {};
export const getBarcode = (state, { tileId }) =>
  state.normalizedMap.entities.barcode[tileId];
// get renderable barcodes, i.e. those on current floor and not 'special'
// this should not compute when only selection.mapTiles changes since inputs won't change then?
// it should only be caching references so we shouldn't worry about recomputation
// although recomputation will create a new array and each selector that depends on it will recompute also.
export const tileIdsSelector = createSelector(
  getCurrentFloorBarcodeIds,
  getBarcodes,
  (barcodeIds, barcodes) => [...barcodeIds.filter(id => !barcodes[id].special)]
);
// just a map of tileIds instead of array. useful to key if tileId is good or not
export const tileIdsMapSelector = createSelector(
  tileIdsSelector,
  tileIds => {
    var ret = {};
    for (var tileId of tileIds) {
      ret[tileId] = true;
    }
    return ret;
  }
);

// since barcodes =/= coordinate sometimes
export const coordinateKeyToBarcodeSelector = createSelector(
  getBarcode,
  barcode => barcode.barcode
);

// assumed that there is one-to-one relationship b/w barcode string and coordinate on a floor
export const currentFloorBarcodeToCoordinateMap = createSelector(
  getCurrentFloorBarcodeIds,
  getBarcodes,
  (tileIds, barcodes) => {
    var ret = {};
    for (var tileId of tileIds) {
      const barcodeString = barcodes[tileId].barcode;
      if (ret[barcodeString]) {
        throw Error(
          `duplicate barcodes on current floor: ${barcodeString}, tile ids ${
            ret[barcodeString]
          }, ${tileId}`
        );
      }
      ret[barcodeString] = tileId;
    }
    return ret;
  }
);

export const barcodeToCoordinateKeySelector = createSelector(
  currentFloorBarcodeToCoordinateMap,
  (_state, { barcode }) => barcode,
  (barcodeCoordinateMap, barcode) => barcodeCoordinateMap[barcode]
);

// get max and min coordinates for current floor. don't need barcode data since
// tileId is already the encoded coordinate
export const tileBoundsSelector = createSelector(
  tileIdsSelector,
  tileIds => {
    // special barcodes are already ignored.
    var coordinates = tileIds.map(tileId =>
      coordinateKeyToTupleOfIntegers(tileId)
    );
    var [xs, ys] = _.unzip(coordinates);
    return {
      maxX: _.max(xs),
      maxY: _.max(ys),
      minX: _.min(xs),
      minY: _.min(ys)
    };
  }
);

// max coordinate including special points. used to generate the new special point.
export const getCurrentFloorMaxCoordinate = createSelector(
  getCurrentFloorBarcodeIds,
  tileIds => {
    var coordinates = tileIds.map(tileId =>
      coordinateKeyToTupleOfIntegers(tileId)
    );
    // just take max in x and y independently...
    var [xs, ys] = _.unzip(coordinates);
    return [_.max(xs), _.max(ys)];
  }
);

export const tileRenderCoordinateSelector = createSelector(
  tileBoundsSelector,
  (state_, props) => props.tileId,
  (tileBounds, tileId) => {
    return tileToWorldCoordinate(tileId, tileBounds);
  }
);

export const spriteRenderCoordinateSelector = createSelector(
  tileRenderCoordinateSelector,
  (state_, { tileId, spriteIdx }) => ({ tileId, spriteIdx }),
  ({ x, y }, { spriteIdx }) => {
    if (spriteIdx === 0) return { x, y };
    // need to offset dot sprite to correct height
    return {
      x:
        x +
        (spriteIdx - 1) * constants.BARCODE_SPRITE_X_OFFSET +
        (spriteIdx > 4 ? constants.AFTER_DOT_SPRITE_X_OFFSET : 0),
      y:
        y +
        constants.BARCODE_SPRITE_Y_OFFSET +
        (spriteIdx == 4 ? constants.DOT_SPRITE_Y_OFFSET : 0)
    };
  }
);

export const tileNameWithoutEntityDataSelector = createSelector(
  getBarcode,
  barcode => {
    var tileSprite = constants.NORMAL;
    if (barcode.store_status) tileSprite = constants.STORABLE;
    return tileSprite;
  }
);

export const tileSpriteNamesWithoutEntityData = createSelector(
  getBarcode,
  tileNameWithoutEntityDataSelector,
  (barcode, tileName) => {
    var spriteNames = barcode.barcode
      .split("")
      .map(char => (char !== "." ? `${char}.png` : "dot.png"));
    return [tileName, ...spriteNames];
  }
);

const getParticularEntity = (state, { entityName }) =>
  state.normalizedMap.entities[entityName] || {};
const getQueueData = state => state.normalizedMap.entities.queueData || {};

export const entitySelectorHelperData = {
  pps: ["pps", constants.PPS],
  charger: ["charger", constants.CHARGER],
  dockPoint: ["dockPoint", constants.DOCK_POINT],
  ods: ["ods", constants.ODS_EXCLUDED],
  fireEmergency: ["fireEmergency", constants.EMERGENCY_EXIT]
};

export const getParticularEntityMap = createCachedSelector(
  getParticularEntity,
  (state_, { entityName }) => entityName,
  (particularEntities, entityName) => {
    var ret = {};
    const [, entitySprite] = entitySelectorHelperData[entityName];
    var list = Object.entries(particularEntities).map(([key, val]) => val);
    var coordinateKeys = list.map(e => e.coordinate);
    coordinateKeys.forEach(key => (ret[key] = entitySprite));
    return ret;
  }
)((state, { entityName }) => entityName);

export const getQueueMap = createSelector(
  getQueueData,
  queueData => {
    var ret = {};
    var queueCoordinates = [].concat(
      ...Object.entries(queueData).map(([key, { coordinates }]) => coordinates)
    );
    // make unique
    var queueCoordinatesWithoutDuplicates = new Set(queueCoordinates);
    queueCoordinatesWithoutDuplicates.forEach(
      (v1, _v2, _set) => (ret[v1] = constants.QUEUE)
    );
    return ret;
  }
);

export const getChargerEntryMap = state => {
  var chargerEntities = getParticularEntity(state, { entityName: "charger" });
  var barcodesDict = getBarcodes(state);
  var ret = {};
  Object.entries(chargerEntities).forEach(
    ([_key, { charger_direction, coordinate }]) => {
      var nb = getNeighbouringBarcodes(coordinate, barcodesDict)[
        charger_direction
      ];
      if (nb) {
        // charger -> special barcode -> charger entry barcode
        var eb = getNeighbouringBarcodes(nb.coordinate, barcodesDict)[
          charger_direction
        ];
        if (eb) ret[eb.coordinate] = constants.CHARGER_ENTRY;
      }
    }
  );
  return ret;
};

// creates map of tileId -> spriteName for all special tiles i.e. tile which
// have some entity (charger, pps, queue etc.)
export const tileEntitySpritesMapSelector = state => {
  var ret = {};
  Object.keys(entitySelectorHelperData).forEach(key => {
    ret = { ...ret, ...getParticularEntityMap(state, { entityName: key }) };
  });
  // queue also
  // charger entry points also
  ret = { ...ret, ...getChargerEntryMap(state) };
  // selected also
  ret = { ...ret, ...getQueueMap(state) };
  return ret;
};

export const specialTileSpritesMapSelector = createSelector(
  tileEntitySpritesMapSelector,
  state => state.selection.mapTiles,
  (entitySpritesMap, selectedMapTiles) => {
    var ret = {};
    Object.keys(selectedMapTiles).forEach(
      key => (ret[key] = constants.SELECTED)
    );
    return { ...entitySpritesMap, ...ret };
  }
);

// TODO: untested
export const distanceTileSpritesSelector = createSelector(
  tileBoundsSelector,
  state => state,
  ({ maxX, maxY, minX, minY }, state) => {
    // return x, y, width, height for all the distance tile sprites
    var ret = [];
    const {
      top: { x: xTopOffset, y: yTopOffset }
    } = constants.DISTANCE_TILE_OFFSETS;
    for (var i = minX; i < maxX; i++) {
      const { x: middle, y: top } = tileRenderCoordinateSelector(state, {
        tileId: tupleOfIntegersToCoordinateKey([i, minY])
      });
      // key is the unique indentifier for a distance tile
      ret.push({
        x: middle + xTopOffset,
        y: top + yTopOffset,
        width: constants.DISTANCE_TILE_WIDTH,
        height: constants.DISTANCE_TILE_HEIGHT,
        key: `c-${i}`
      });
    }
    const {
      left: { x: xLeftOffset, y: yLeftOffset }
    } = constants.DISTANCE_TILE_OFFSETS;
    for (var i = minY; i < maxY; i++) {
      const { x: right, y: top } = tileRenderCoordinateSelector(state, {
        tileId: tupleOfIntegersToCoordinateKey([maxX, i])
      });
      ret.push({
        x: right + xLeftOffset,
        y: top + yLeftOffset,
        width: constants.DISTANCE_TILE_HEIGHT,
        height: constants.DISTANCE_TILE_WIDTH,
        key: `r-${i}`
      });
    }
    return ret;
  }
);

export const getAllInBetweenDistances = (arrOfTuple, direction, barcodesDict) =>
  arrOfTuple.map(([tileId1, tileId2]) => {
    const [barcode1, barcode2] = [barcodesDict[tileId1], barcodesDict[tileId2]];
    if (barcode1 && barcode2) {
      var distance =
        barcode1.size_info[direction] + barcode2.size_info[(direction + 2) % 4];
      if (barcode1.adjacency && barcode2.adjacency) {
        // there might be special barcode between them
        var specialTileId = tupleOfIntegersToCoordinateKey(
          barcode1.adjacency[direction]
        );
        var specialBarcode = barcodesDict[specialTileId];
        if (specialBarcode && specialBarcode.special)
          distance +=
            specialBarcode.size_info[direction] +
            specialBarcode.size_info[(direction + 2) % 4];
      }
      return distance;
    }
    return 0;
  });

export const getMaxInBetweenDistance = (arrOfTuple, direction, barcodesDict) =>
  _.max(getAllInBetweenDistances(arrOfTuple, direction, barcodesDict));

export const getAllColumnTileIdTuples = ({ maxY, minY }, distanceTileKey) => {
  const i = parseInt(distanceTileKey.match(/c\-(.*)/)[1]);
  var arrOfTuple = [];
  for (var j = minY; j <= maxY; j++) {
    var tileId1 = tupleOfIntegersToCoordinateKey([i, j]);
    var tileId2 = tupleOfIntegersToCoordinateKey([i + 1, j]);
    arrOfTuple.push([tileId1, tileId2]);
  }
  return arrOfTuple;
};

export const getAllRowTileIdTuples = ({ maxX, minX }, distanceTileKey) => {
  const j = parseInt(distanceTileKey.match(/r\-(.*)/)[1]);
  var arrOfTuple = [];
  for (var i = minX; i <= maxX; i++) {
    var tileId1 = tupleOfIntegersToCoordinateKey([i, j]);
    var tileId2 = tupleOfIntegersToCoordinateKey([i, j + 1]);
    arrOfTuple.push([tileId1, tileId2]);
  }
  return arrOfTuple;
};

// TODO: untested
export const getTileInBetweenDistances = createSelector(
  tileBoundsSelector,
  getBarcodes,
  ({ maxX, maxY, minX, minY }, barcodesDict) => {
    var ret = [];
    // columns
    for (var i = minX; i < maxX; i++) {
      var arrOfTuple = getAllColumnTileIdTuples({ maxY, minY }, `c-${i}`);
      ret.push(getMaxInBetweenDistance(arrOfTuple, 3, barcodesDict));
    }
    // rows
    for (var j = minY; j < maxY; j++) {
      var arrOfTuple = getAllRowTileIdTuples({ maxX, minX }, `r-${j}`);
      ret.push(getMaxInBetweenDistance(arrOfTuple, 2, barcodesDict));
    }
    return ret;
  }
);

// TODO: test
export const getFitToSizeViewportRect = createSelector(
  tileBoundsSelector,
  tileBounds => {
    const { maxX, maxY, minX, minY } = tileBounds;
    const { x: left, y: top } = tileToWorldCoordinate(
      tupleOfIntegersToCoordinateKey([maxX, minY]),
      tileBounds
    );
    const { x: right, y: bottom } = tileToWorldCoordinate(
      tupleOfIntegersToCoordinateKey([minX, maxY]),
      tileBounds
    );
    // offset by a little
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
  (_state, { newEntities }) => newEntities,
  (entitiesObj, newEntities) => {
    var nextId =
      Object.keys(entitiesObj).reduce((prev, key) => Math.max(prev, key), 0) +
      1;
    // entity already exists if coordinate is same as of an existing entity. so return old id only
    return newEntities.map(
      entity =>
        parseInt(_.findKey(entitiesObj, { coordinate: entity.coordinate })) ||
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
  tileIdsSelector,
  tileBoundsSelector,
  distanceTileSpritesSelector,
  state => state.selectedArea,
  (tileIds, tileBounds, distanceTileRects, selectedArea) => {
    if (!selectedArea) return [];
    const selectionRect = getRectFromDiagonalPoints(selectedArea);
    const selectedMapTiles = tileIds.filter(tileId => {
      const { x: left, y: top } = tileToWorldCoordinate(tileId, tileBounds);
      var rect = {
        left,
        right: left + constants.TILE_SPRITE_WIDTH,
        top,
        bottom: top + constants.TILE_SPRITE_HEIGHT
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

// initializes with 500,500 for first special barcode
export const getNewSpecialCoordinates = createSelector(
  specialBarcodesCoordinateSelector,
  (_state, { n }) => n,
  (coordinateKeys, n) => {
    const start =
      coordinateKeys.length == 0
        ? 500
        : coordinateKeys
            .map(coordinateKey =>
              Math.max(...coordinateKeyToTupleOfIntegers(coordinateKey))
            )
            .sort()
            .reverse()[0] + 1;
    var ret = [];
    for (var i = 0; i < n; i++) {
      ret.push(`${start + i},${start + i}`);
    }
    return ret;
  }
);

export const currentFloorBotWithRackThreshold = state =>
  state.normalizedMap.entities.floor[state.currentFloor].metadata
    .botWithRackThreshold;
export const currentFloorBotWithoutRackThreshold = state =>
  state.normalizedMap.entities.floor[state.currentFloor].metadata
    .botWithoutRackThreshold;
