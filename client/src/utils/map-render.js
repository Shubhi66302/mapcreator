// helper methods for rendering. impure methods (kind of) since reselect was not
// efficient enough. need information of previous state to work correctly
import {
  tileSpriteNamesWithoutEntityData,
  tileNameWithoutEntityDataSelector,
  spriteRenderCoordinateSelector,
  getTileSpriteScale,
  getCurrentFloorBarcodes,
  specialTileSpritesMapSelector
} from "../utils/selectors";
import { dummyState } from "reducers/util";
import * as PIXI from "pixi.js";

// some exports are for testing

export var createOrUpdateAllSprites = (container, state, tileId) => {
  var spriteNames = tileSpriteNamesWithoutEntityData(state, { tileId });
  for (var idx = 0; idx < 9; idx++)
  {
    var {xScale, yScale} = getTileSpriteScale(state, {tileId, spriteIdx: idx});
    var { x, y } = spriteRenderCoordinateSelector(state, {tileId, spriteIdx: idx});
    let sprite = container.spriteMap[`${tileId}-${idx}`];
    if (!sprite)
    {
      // make new sprite.
      sprite = new PIXI.Sprite(PIXI.loader.resources["mySpritesheet"].textures[spriteNames[idx]]);
      sprite.scale.x = xScale;
      sprite.scale.y = yScale;
      container.addChild(sprite);
      container.spriteMap[`${tileId}-${idx}`] = sprite;
    }
    else
    {
      sprite.texture = PIXI.loader.resources["mySpritesheet"].textures[spriteNames[idx]];
      sprite.alpha = 1;
    }
    sprite.x = x;
    sprite.y = y;
  }
};

// will define selectors 3 cases:
// 1. tileIds update (use tileIds selector twice) -> re render everything O(n)
// 2. barcode entity updates: re-render tiles. also re-render barcode sprites if changed.
// 2. Other entity updates (charger, pps, selection.mapTiles etc. etc.) -> diff render entity, maybe just re-render all every time.

// called whenever tileIds change.
export var tileIdsUpdate = (container, state, prevState) => {
  var prevBarcodes = getCurrentFloorBarcodes(prevState);
  var barcodes = getCurrentFloorBarcodes(state);
  if (prevBarcodes === barcodes) return; // nothing to do.
  // remove childrend and set spritemap to empty... actually pretty efficient.
  container.removeChildren();
  container.spriteMap = {};
  for (var barcodeId in barcodes) {
    const barcodeInfo = barcodes[barcodeId];
    createOrUpdateAllSprites(container, state, barcodeInfo.coordinate);
  };
  return container;
};



// updater that does all the entity (pps, charger, queue etc.) and selected tile rendering.
// almost always run...
export var tileSpriteUpdate = (container, state, prevState) => {
  if (
    state.normalizedMap.entities === prevState.normalizedMap.entities &&
    state.selection.mapTiles === prevState.selection.mapTiles
  )
    return;
  var prevSpecial = specialTileSpritesMapSelector(prevState);
  var special = specialTileSpritesMapSelector(state);
  // these maps have not been filtered for current floor, so need to do that.
  // need to correct both previous and current special
  Object.entries(prevSpecial).forEach(([tileId]) => {
    if (!container.spriteMap[`${tileId}-0`]) return;
    var spriteName = tileNameWithoutEntityDataSelector(state, { tileId });
    container.spriteMap[`${tileId}-0`].texture =
      PIXI.loader.resources["mySpritesheet"].textures[
        special[tileId] || spriteName
      ];
  });
  Object.entries(special).forEach(([tileId, spriteName]) => {
    if (!container.spriteMap[`${tileId}-0`]) return;
    // prevSpecial's are already corrected.
    if (!prevSpecial[tileId])
      container.spriteMap[`${tileId}-0`].texture =
        PIXI.loader.resources["mySpritesheet"].textures[spriteName];
  });
};

// only this one needs to be exposed.
var allUpdates = (container, state) => {
  var prevState = container.prevState || dummyState;
  tileIdsUpdate(container, state, prevState);
  tileSpriteUpdate(container, state, prevState);
  container.prevState = state;
};

export default allUpdates;
