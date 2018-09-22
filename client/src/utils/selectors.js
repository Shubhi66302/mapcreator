// using reselect for memoization
// mainly selectors for map rendering
import { createSelector } from "reselect";
import createCachedSelector from "re-reselect";
import {
  coordinateKeyToTupleOfIntegers,
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
// this should not compute when only selectedTiles changes since inputs won't change then?
// it should only be caching references so we shouldn't worry about recomputation
// although recomputation will create a new array and each selector that depends on it will recompute also.
export const tileIdsSelector = createSelector(
  getCurrentFloorBarcodeIds,
  getBarcodes,
  (barcodeIds, barcodes) => [...barcodeIds.filter(id => !barcodes[id].special)]
);
// just a map of tileIds instead of array. useful to key if tileId is good or not
export const tileIdsMapSelector = createSelector(tileIdsSelector, tileIds => {
  var ret = {};
  for (var tileId of tileIds) {
    ret[tileId] = true;
  }
  return ret;
});

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
export const tileBoundsSelector = createSelector(tileIdsSelector, tileIds => {
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
});

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
  ({ x, y }, { tileId, spriteIdx }) => {
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

export const getQueueMap = createSelector(getQueueData, queueData => {
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
});

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
  state => state.selectedTiles,
  (entitySpritesMap, selectedTiles) => {
    var ret = {};
    Object.keys(selectedTiles).forEach(key => (ret[key] = constants.SELECTED));
    return { ...entitySpritesMap, ...ret };
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

export const getDragSelectedTileIds = createSelector(
  tileIdsSelector,
  tileBoundsSelector,
  state => state.selectedArea,
  (tileIds, tileBounds, selectedArea) => {
    if (!selectedArea) return [];
    const selectionRect = getRectFromDiagonalPoints(selectedArea);
    return tileIds.filter(tileId => {
      const { x: left, y: top } = tileToWorldCoordinate(tileId, tileBounds);
      var rect = {
        left,
        right: left + constants.TILE_SPRITE_WIDTH,
        top,
        bottom: top + constants.TILE_SPRITE_HEIGHT
      };
      return intersectRect(selectionRect, rect);
    });
  }
);
