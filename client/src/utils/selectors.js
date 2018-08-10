// using reselect for memoization
// this file is only used for selecting sprite data. that means spriteName, x, y and also list of tiles.
// mainly exports two selectors:
// 1. spriteNameSelector : get sprite name for sprite
// 2. spriteCoordinateSelector: get world coordinate for sprite
// selector 1 will be specific to EACH sprite (i.e. separate selector using selector creator)
// since it only needs to memoize state.normalizedMap.entities.barcode[tileId] plus ppses etc. (not barcodes)
// i.e it doesn't memoize the whole map.
// however selector 2 needs to memoize whole map since coordinate depends on max/min barcode coordinates
// of map.
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
const getBarcodes = state => state.normalizedMap.entities.barcode;
const getBarcode = (state, { tileId }) => getBarcodes(state)[tileId];

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

// calculate coordinate at which tile will be rendered
// coordinate is [y,x] ?? or maybe it's just used differently in mapcreator, will have to check

// this is the old code for tile rendering in d3 mapcreator:
// .attr("x", function(current_key) {
//     return global_variable.window_width -
//         (global_variable.x0 + (decrypted_tile_key[1] - global_variable.y_used_range[0] - 1) *
//           (global_variable.tile_width - 10));
// })
// .attr("y", function(current_key) {
//     return global_variable.y0 + (decrypted_tile_key[0] - global_variable.x_used_range[0] + 1) *
//       global_variable.tile_height;
// })
// .attr("width", global_variable.tile_width - 20)
// .attr("height", global_variable.tile_height - 20)
// second selector ignores state, first ignores props...
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

export const tileNameWithoutEntityData = createSelector(getBarcode, barcode => {
  var tileSprite = constants.NORMAL;
  if (barcode.storable) tileSprite = constants.STORABLE;
  return tileSprite;
});

export const tileSpriteNamesWithoutEntityData = createSelector(
  getBarcode,
  tileNameWithoutEntityData,
  (barcode, tileName) => {
    var spriteNames = barcode.barcode
      .split("")
      .map(char => (char !== "." ? `${char}.png` : "dot.png"));
    return [tileName, ...spriteNames];
  }
);

// separated out these functions for testing, have to export them also for same reason...
// TODO: add babel rewire plugin to test these?
// https://github.com/facebook/create-react-app/issues/4832
export var findTileIdInObj = (listMap, getBarcodeFn, tileId) => {
  var list = Object.entries(listMap || {}).map(([key, val]) => val);
  var coordinateKeys = list.map(e => barcodeToCoordinateKey(getBarcodeFn(e)));
  return coordinateKeys.find(e => e === tileId) !== undefined ? true : false;
};

export var findTileIdInQueueData = (queuesObj, tileId) => {
  var queues = Object.entries(queuesObj || {}).map(([key, queue]) => queue);
  var queueCoordinateKeys = []
    .concat(...queues)
    .map(([barcode, someNumber]) => barcodeToCoordinateKey(barcode));
  return queueCoordinateKeys.find(e => e === tileId) !== undefined
    ? true
    : false;
};

// const getQueueData = state => state.normalizedMap.entities.queueData;
const getEntities = state => state.normalizedMap.entities;
const getIfTileSelected = (state, { tileId }) => state.selectedTiles[tileId];

// separate code for finding if stuff that just depends on barcode and entities
export const tileSpritesEntitySelector = createCachedSelector(
  getBarcode,
  getEntities,
  (barcode, entities) => {
    // console.log(
    //   `recomputing barcode sprite for ${barcode.barcode} using entities`
    // );
    var tileId = barcode.coordinate;
    var tileSprite = constants.NORMAL;
    if (barcode.storable) {
      tileSprite = constants.STORABLE;
    }
    [
      ["pps", constants.PPS, e => e.location],
      ["charger", constants.CHARGER, e => e.charger_location],
      ["dockPoint", constants.DOCK_POINT, e => e.position],
      ["ods", constants.ODS_EXCLUDED, e => e.ods_tuple.slice(0, 7)],
      ["fireEmergency", constants.EMERGENCY_EXIT, e => e.barcode]
    ].forEach(([key, spriteName, getBarcodeFn]) => {
      var listMap = entities[key] || {};
      if (findTileIdInObj(listMap, getBarcodeFn, tileId))
        tileSprite = spriteName;
    });
    // queue logic\
    var queuesObj = entities.queueData || {};
    if (findTileIdInQueueData(queuesObj, tileId)) tileSprite = constants.QUEUE;
    return tileSprite;
  }
)((state, { tileId }) => tileId);
// finds all 8 tile sprites
export const tileSpritesSelector = createCachedSelector(
  getBarcode,
  tileSpritesEntitySelector,
  getIfTileSelected,
  (barcode, tileSprite, tileSelected) => {
    if (barcode.barcode.length !== 7) {
      throw new Error(`got barcode string ${barcode.barcode} of length not 7`);
    }
    // tileId is already encoded in barcode as 'coordinate'. this will always be the case
    // since it is specified to be the keyed id in normalizr schema
    var spriteNames = barcode.barcode
      .split("")
      .map(char => (char !== "." ? `${char}.png` : "dot.png"));

    if (tileSelected) {
      tileSprite = constants.SELECTED;
    }
    // this creates a new list, so memoization won't work when this fn is recalcuated, even if same value is returned.
    // maybe a different equals function can be used in selector that uses this one?
    return [tileSprite, ...spriteNames];
  }
)((state, { tileId }) => tileId);

// const getIfTileSelected = (state, {tileId}) => state.selectedTiles[tileId]
//
// // mainly tileBaseSpriteSelector, but makes tile 'selected' if it is selected in UI
// export const tileMainSpriteSelector = createSelector(
//   tileBaseSpriteSelector,
//   getIfTileSelected,
//   (baseSprite, tileSelected) => {
//     if (tileSelected)
//       return constants.SELECTED;
//     return baseSprite;
//   }
// )

// export const tileMainSpriteSelector = (state, {tileId}) => {
//
//   // TODO: add charger entry logic
//   // TODO: add zone logic to show zones when in view zones mode
//   // this should be last since selection overrides all other things
//   if (state.selectedTiles[tileId]) {
//     tileSprite = constants.SELECTED;
//   }
//   return tileSprite
// }
// const getBarcodeString = (state, {tileId}) => getBarcodes(state)[tileId].barcode;
//
// export const tileBarcodeSpriteSelector = (state, props) => {
//   var barcodeString = getBarcodeString(state, props);
//   if (barcodeString.length !== 7) {
//     throw new Error(`expected ${barcodeString} to have length 7`)
//   }
//   const {tileId, spriteIdx} =
// }
// // this is not a memoized selector
// export const tileSpritesSelector = (state, { tileId }) => {
//
// };

// TODO: use better equals function for this selector?
// maybe lodash.isEqual. although there isn't any significant recomputation so maybe
// not required.
// export const tileDataSelector = createSelector(
//   tileSpritesSelector,
//   tileRenderCoordinateSelector,
//   (tileSprites, tileCoordinate) => ({
//     ...tileCoordinate,
//     spriteNames: tileSprites
//   })
// );

export const tileDataSelector = createCachedSelector(
  tileSpritesSelector,
  tileRenderCoordinateSelector,
  (tileSprites, tileCoordinate) => ({
    ...tileCoordinate,
    spriteNames: tileSprites
  })
)((state, { tileId }) => tileId);

// export const tileSpriteDataSelector = createSelector(
//   tileDataSelector,
//   (state, props) => props.spriteIdx,
//   ({ x, y, spriteNames }, spriteIdx) => {
//     if (spriteIdx === 0) return { x, y, spriteName: spriteNames[0] };
//     return {
//       x: x + (spriteIdx - 1) * constants.BARCODE_SPRITE_X_OFFSET,
//       y: y + constants.BARCODE_SPRITE_Y_OFFSET,
//       spriteName: spriteNames[spriteIdx]
//     };
//   }
// );

// need a separate selector for each sprite! no, use re-reselect
// export const makeTileSpriteDataSelector = () => {
//   return createSelector(
//     tileDataSelector,
//     (state, props) => props.spriteIdx,
//     ({ x, y, spriteNames }, spriteIdx) => {
//       if (spriteIdx === 0) return { x, y, spriteName: spriteNames[0] };
//       return {
//         x: x + (spriteIdx - 1) * constants.BARCODE_SPRITE_X_OFFSET,
//         y: y + constants.BARCODE_SPRITE_Y_OFFSET,
//         spriteName: spriteNames[spriteIdx]
//       };
//     }
//   );
// };
export const tileSpriteDataSelector = createCachedSelector(
  tileDataSelector,
  (state, props) => props.spriteIdx,
  ({ x, y, spriteNames }, spriteIdx) => {
    if (spriteIdx === 0) return { x, y, spriteName: spriteNames[0] };
    return {
      x: x + (spriteIdx - 1) * constants.BARCODE_SPRITE_X_OFFSET,
      y: y + constants.BARCODE_SPRITE_Y_OFFSET,
      spriteName: spriteNames[spriteIdx]
    };
  }
)((state, { tileId, spriteIdx }) => `${tileId}-${spriteIdx}`);
// // not memoized
// export const tileSpriteDataSelector = (state, props) => {
//   const { x, y, spriteNames } = tileDataSelector(state, props);
//   // modify x, y to position
//   const { tileId, spriteIdx } = props;
//   if (spriteIdx === 0) return { x, y, spriteName: spriteNames[0] };
//   return {
//     x: x + (spriteIdx - 1) * constants.BARCODE_SPRITE_X_OFFSET,
//     y: y + constants.BARCODE_SPRITE_Y_OFFSET,
//     spriteName: spriteNames[spriteIdx]
//   };
// };

// forget everything, just make a selectors that give out updates which will be
// applied to the ParticleContainer.
