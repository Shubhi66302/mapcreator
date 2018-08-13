// using reselect for memoization
// mainly selectors for map rendering
import { createSelector } from "reselect";
import createCachedSelector from "re-reselect";
import {
  coordinateKeyToTupleOfIntegers,
  barcodeToCoordinateKey,
  tileToWorldCoordinate
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
    return {
      x: x + (spriteIdx - 1) * constants.BARCODE_SPRITE_X_OFFSET,
      y: y + constants.BARCODE_SPRITE_Y_OFFSET
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
  pps: ["pps", constants.PPS, e => e.location],
  charger: ["charger", constants.CHARGER, e => e.charger_location],
  dockpoint: ["dockPoint", constants.DOCK_POINT, e => e.position],
  ods: ["ods", constants.ODS_EXCLUDED, e => e.ods_tuple.slice(0, 7)],
  fireEmergency: ["fireEmergency", constants.EMERGENCY_EXIT, e => e.barcode]
};

export const getParticularEntityMap = createCachedSelector(
  getParticularEntity,
  (state_, { entityName }) => entityName,
  (particularEntities, entityName) => {
    var ret = {};
    const [, entitySprite, getBarcodeFn] = entitySelectorHelperData[entityName];
    var list = Object.entries(particularEntities).map(([key, val]) => val);
    var coordinateKeys = list.map(e => barcodeToCoordinateKey(getBarcodeFn(e)));
    coordinateKeys.forEach(key => (ret[key] = entitySprite));
    return ret;
  }
)((state, { entityName }) => entityName);

export const getQueueMap = createSelector(getQueueData, queueData => {
  var ret = {};
  var queues = Object.entries(queueData).map(([key, queue]) => queue);
  var queueCoordinateKeys = []
    .concat(...queues)
    .map(([barcode, someNumber]) => barcodeToCoordinateKey(barcode));
  queueCoordinateKeys.forEach(key => (ret[key] = constants.QUEUE));
  return ret;
});
// forget everything, just make a selectors that give out updates which will be
// applied to the ParticleContainer.

// creates map of tileId -> spriteName for all special tiles i.e. tile which
// have some entity (charger, pps, queue etc.)
export const tileEntitySpritesMapSelector = state => {
  var ret = {};
  Object.keys(entitySelectorHelperData).forEach(key => {
    ret = { ...ret, ...getParticularEntityMap(state, { entityName: key }) };
  });
  // queue also
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
