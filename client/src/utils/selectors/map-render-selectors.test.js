import * as mapRenderSelectors from "./map-render-selectors";
import { getTileBoundingBox } from "./world-coordinate-utils-selectors";
import { fromJS } from "immutable";
import {
  makeState,
  singleFloor,
  singleFloorVanilla,
  twoFloors
} from "../test-helper";
import * as constants from "../../constants";

describe("getTileSpriteScale", () => {
  const { getTileSpriteScale } = mapRenderSelectors;
  test("should give correct scale for a non-special coordinate", () => {
    var state = makeState(singleFloor, 1);
    const scale = getTileSpriteScale(state, { tileId: "1,0" });
    // scale  = (BarcodeSizeInDir / 150) * ((1500 - CG) / 1500)
    // here 1500 = default barcode size and 150 = barcode sprite size in pixel
    // and CG = 500
    // For "1,0" -> BarcodeSizeInDir in both dir = 1500
    const expectedXScale = 1000 / 150;
    const expectedYScale = 1000 / 150;
    expect(scale.xScale).toBeCloseTo(expectedXScale);
    expect(scale.yScale).toBeCloseTo(expectedYScale);
  });
  test("should give correct scale for a special coordinate", () => {
    var state = makeState(singleFloor, 1);
    const scale = getTileSpriteScale(state, { tileId: "12,12" });
    // For "12,12" -> BarcodeSizeInDir Y = 410
    // For "12,12" -> BarcodeSizeInDir Y = 1500
    const expectedXScale = 1000 / 150;
    const expectedYScale = (410 / 1500) * (1000 / 150);
    expect(scale.xScale).toBeCloseTo(expectedXScale);
    expect(scale.yScale).toBeCloseTo(expectedYScale);
  });
  test("should give scale values as half of the value when size was double", () => {
    var singleFloorVanillaWithAnotherBarcode = singleFloorVanilla.updateIn(
      ["map", "floors", 0, "map_values"],
      (map_values = []) =>
        fromJS([
          ...map_values,
          {
            blocked: false,
            zone: "defzone",
            coordinate: "3,2",
            special: false,
            store_status: 0,
            barcode: "002.003",
            neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
            size_info: [750, 750, 750, 750],
            botid: "null"
          },
          {
            blocked: false,
            zone: "defzone",
            coordinate: "4,2",
            special: false,
            store_status: 0,
            barcode: "002.004",
            neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
            size_info: [375, 375, 375, 375],
            botid: "null"
          }
        ])
    );
    var state = makeState(singleFloorVanillaWithAnotherBarcode);
    const scaleOne = getTileSpriteScale(state, { tileId: "3,2" });
    const scaleTwo = getTileSpriteScale(state, { tileId: "4,2" });
    expect(scaleOne.xScale).toEqual(scaleTwo.xScale * 2);
    expect(scaleOne.yScale).toEqual(scaleTwo.yScale * 2);
  });

  describe("should stretch the barcode sprite to completely fill the tile bounding box", () => {
    // we stretch the barcode.png sprite by the scale when rendering
    // make sure that it fits the bounding box exactly. otherwise hit registration won't be perfect
    // i.e. its final width/height are same as bounding box's width and height
    test("normal sprite \"1,0\" of top left in single floor", () => {
      var state = makeState(singleFloor, 1);
      const scale = getTileSpriteScale(state, { tileId: "1,0" });
      const boundingBox = getTileBoundingBox(state, { tileId: "1,0" });
      const boundingBoxWidth = boundingBox.right - boundingBox.left;
      const boundingBoxHeight = boundingBox.bottom - boundingBox.top;
      const spriteWidth = constants.TILE_SPRITE_WIDTH * scale.xScale;
      const spriteHeight = constants.TILE_SPRITE_HEIGHT * scale.yScale;
      expect(boundingBoxWidth).toBeCloseTo(spriteWidth);
      expect(boundingBoxHeight).toBeCloseTo(spriteHeight);
    });
    test("special coordinate (lesser size, see other test for its actual dimensions)", () => {
      // test is exactly same as previous one, just copy pasting for clarity
      var state = makeState(singleFloor, 1);
      const scale = getTileSpriteScale(state, { tileId: "12,12" });
      const boundingBox = getTileBoundingBox(state, { tileId: "12,12" });
      const boundingBoxWidth = boundingBox.right - boundingBox.left;
      const boundingBoxHeight = boundingBox.bottom - boundingBox.top;
      const spriteWidth = constants.TILE_SPRITE_WIDTH * scale.xScale;
      const spriteHeight = constants.TILE_SPRITE_HEIGHT * scale.yScale;
      expect(boundingBoxWidth).toBeCloseTo(spriteWidth);
      expect(boundingBoxHeight).toBeCloseTo(spriteHeight);
    });
  });
});

describe("getMainTileSpriteData", () => {
  const { getMainTileSpriteData, getTileSpriteScale } = mapRenderSelectors;
  describe("Sprite names", () => {
    test("should give correct tile name without entity info", () => {
      var state = makeState(twoFloors, 1);
      expect(getMainTileSpriteData(state, { tileId: "2,0" })).toMatchObject({
        name: constants.STORABLE
      });
      expect(getMainTileSpriteData(state, { tileId: "1,0" })).toMatchObject({
        name: constants.NORMAL
      });
      expect(getMainTileSpriteData(state, { tileId: "1,2" })).toMatchObject({
        name: constants.NORMAL
      });
    });
    test("should not give storables when in zone view mode", () => {
      var state = makeState(twoFloors, 1);
      state.selection.zoneViewMode = true;
      expect(getMainTileSpriteData(state, { tileId: "2,0" })).toMatchObject({
        name: constants.NORMAL
      });
    });
  });
  describe("Sprite coordinates and scale", () => {
    test("should give correct coordinates for a main tile sprite", () => {
      var state = makeState(singleFloor, 1);
      var data = getMainTileSpriteData(state, {
        tileId: "2,0"
      });
      const { xScale, yScale } = getTileSpriteScale(state, { tileId: "2,0" });
      var { top, left } = getTileBoundingBox(state, { tileId: "2,0" });
      expect(data.x).toEqual(left);
      expect(data.y).toEqual(top);
      expect(data.xScale).toBeCloseTo(xScale);
      expect(data.yScale).toBeCloseTo(yScale);
    });
  });
});

describe("getBarcodeDigitSpritesNames", () => {
  const { getBarcodeDigitSpritesNames } = mapRenderSelectors;
  describe("should give correct sprite names for barcode digits", () => {
    test("should give correct barcode sprite names for normal tile", () => {
      var state = makeState(twoFloors, 1);
      var sprites = getBarcodeDigitSpritesNames(state, { tileId: "1,2" });
      expect(sprites).toEqual([
        "0.png",
        "0.png",
        "2.png",
        "dot.png",
        "0.png",
        "0.png",
        "1.png"
      ]);
    });
    test("should give correct barcode sprite names for storable tile", () => {
      var state = makeState(twoFloors, 1);
      var sprites = getBarcodeDigitSpritesNames(state, { tileId: "2,0" });
      expect(sprites).toEqual([
        "0.png",
        "0.png",
        "0.png",
        "dot.png",
        "0.png",
        "0.png",
        "2.png"
      ]);
    });
  });
});

describe("getBarcodeDigitSpritesData", () => {
  const { getBarcodeDigitSpritesData, getTileSpriteScale } = mapRenderSelectors;
  describe("should give all kinds of correct data for digit sprites for 1,2", () => {
    var state = makeState(twoFloors, 1);
    var sprites = getBarcodeDigitSpritesData(state, { tileId: "1,2" });
    test("should have 7 sprites (6 digits and 1 dot)", () => {
      expect(Object.entries(sprites)).toHaveLength(7);
    });
    test("should have 7 keys 0-6", () => {
      expect(Object.keys(sprites)).toEqual(["0", "1", "2", "3", "4", "5", "6"]);
    });
    test("each element itself should have keys name, x, y, xScale, yScale", () => {
      Object.values(sprites).forEach(obj => {
        expect(obj).toHaveProperty("name");
        expect(obj).toHaveProperty("x");
        expect(obj).toHaveProperty("y");
        expect(obj).toHaveProperty("xScale");
        expect(obj).toHaveProperty("yScale");
        expect(Object.entries(obj)).toHaveLength(5);
      });
    });
    test("scale for element must be same as main tile scale", () => {
      const tileScale = getTileSpriteScale(state, { tileId: "1,2" });
      Object.values(sprites).forEach(({ xScale, yScale }) => {
        expect(tileScale.xScale).toBeCloseTo(xScale);
        expect(tileScale.yScale).toBeCloseTo(yScale);
      });
    });
    // Not really testing values of coordinates x and y since very hard to test their correctness anyway
  });
});

describe("getDirectionalitySpritesNames", () => {
  const { getDirectionalitySpritesNames } = mapRenderSelectors;
  test("should give [\"000.png\", \"000.png\", \"111.png\", \"111.png\"] for sprite 0,0 in vanilla map which is normal", () => {
    var state = makeState(singleFloorVanilla, 1);
    expect(getDirectionalitySpritesNames(state, { tileId: "0,0" })).toEqual([
      "000.png",
      "000.png",
      "111.png",
      "111.png"
    ]);
  });
  test("should give [null, null, null, null] for sprite 1,1 in vanilla map", () => {
    // 1,1 has only 0,0,0 or 1,1,1 neighbours so all names should be null
    var state = makeState(singleFloorVanilla, 1);
    expect(getDirectionalitySpritesNames(state, { tileId: "1,1" })).toEqual([
      null,
      null,
      null,
      null
    ]);
  });
  test("should give sprite name 110.png in all direction for 12,12", () => {
    var state = makeState(singleFloor, 1);
    expect(getDirectionalitySpritesNames(state, { tileId: "12,12" })).toEqual([
      "110.png",
      "000.png",
      "110.png",
      "000.png"
    ]);
  });
  test("should have all direction names in case of 2,1", () => {
    var state = makeState(singleFloor, 1);
    expect(getDirectionalitySpritesNames(state, { tileId: "2,1" })).toEqual([
      constants.DIRECTIONALITY_SPRITES_MAP[[1, 1, 1]],
      constants.DIRECTIONALITY_SPRITES_MAP[[1, 1, 1]],
      constants.DIRECTIONALITY_SPRITES_MAP[[1, 1, 0]],
      constants.DIRECTIONALITY_SPRITES_MAP[[0, 0, 0]]
    ]);
  });
});

describe("getDirectionalitySpriteCoordinateData", () => {
  const {
    getDirectionalitySpriteCoordinateData,
    getTileSpriteScale
  } = mapRenderSelectors;
  describe("should give correct data in all directions for 1,2", () => {
    var state = makeState(singleFloor, 1);
    var spritesCoordinateData = getDirectionalitySpriteCoordinateData(state, {
      tileId: "1,2"
    });
    const { top, right, bottom, left } = getTileBoundingBox(state, {
      tileId: "1,2"
    });
    const tileScale = getTileSpriteScale(state, { tileId: "1,2" });
    test("top", () => {
      const topSprite = spritesCoordinateData[0];
      expect(topSprite.x).toBeCloseTo(right);
      expect(topSprite.y).toBeCloseTo(top);
      // scales are swapped
      expect(topSprite.xScale).toBeCloseTo(tileScale.yScale);
      expect(topSprite.yScale).toBeCloseTo(tileScale.xScale);
      expect(topSprite.rotation).toBeCloseTo(Math.PI / 2);
    });
    test("right", () => {
      const rightSprite = spritesCoordinateData[1];
      expect(rightSprite.x).toBeCloseTo(right);
      expect(rightSprite.y).toBeCloseTo(bottom);
      expect(rightSprite.xScale).toBeCloseTo(tileScale.xScale);
      expect(rightSprite.yScale).toBeCloseTo(tileScale.yScale);
      expect(rightSprite.rotation).toBeCloseTo(Math.PI);
    });
    test("bottom", () => {
      const bottomSprite = spritesCoordinateData[2];
      expect(bottomSprite.x).toBeCloseTo(left);
      expect(bottomSprite.y).toBeCloseTo(bottom);
      // scales are swapped
      expect(bottomSprite.xScale).toBeCloseTo(tileScale.yScale);
      expect(bottomSprite.yScale).toBeCloseTo(tileScale.xScale);
      expect(bottomSprite.rotation).toBeCloseTo(Math.PI * (3 / 2));
    });
    test("left", () => {
      const leftSprite = spritesCoordinateData[3];
      expect(leftSprite.x).toBeCloseTo(left);
      expect(leftSprite.y).toBeCloseTo(top);
      expect(leftSprite.xScale).toBeCloseTo(tileScale.xScale);
      expect(leftSprite.yScale).toBeCloseTo(tileScale.yScale);
      expect(leftSprite.rotation).toBe(undefined);
    });
  });
});

describe("getDirectionalitySpritesData", () => {
  const { getDirectionalitySpritesData } = mapRenderSelectors;
  test("should be an empty object for 1,1 in vanilla map since no sprites to be drawn for it", () => {
    var state = makeState(singleFloorVanilla, 1);
    var sprites = getDirectionalitySpritesData(state, { tileId: "1,1" });
    expect(sprites).toEqual({});
  });
  describe("should be top left right bottom sprite for 1,2", () => {
    var state = makeState(singleFloor, 1);
    var sprites = getDirectionalitySpritesData(state, { tileId: "1,2" });
    expect(sprites).toHaveProperty("top");
    expect(sprites).toHaveProperty("right");
    expect(sprites).toHaveProperty("bottom");
    expect(sprites).toHaveProperty("left");
    test("left one shouldn't have rotation", () => {
      ["name", "x", "y", "xScale", "yScale"].forEach(key =>
        expect(sprites["left"]).toHaveProperty(key)
      );
      expect(sprites["left"]).not.toHaveProperty("rotation");
    });
  });
  describe("correct data for 12,12", () => {
    var state = makeState(singleFloor, 1);
    var sprites = getDirectionalitySpritesData(state, { tileId: "12,12" });
    test("should have all keys", () => {
      expect(sprites).toHaveProperty("top");
      expect(sprites).toHaveProperty("right");
      expect(sprites).toHaveProperty("bottom");
      expect(sprites).toHaveProperty("left");
    });
    test("should have all names as well has the coordinate data for top, bottom", () => {
      ["top", "bottom"].forEach(dirSpriteKey => {
        expect(sprites).toHaveProperty(dirSpriteKey);
        ["name", "x", "y", "xScale", "yScale", "rotation"].forEach(key =>
          expect(sprites[dirSpriteKey]).toHaveProperty(key)
        );
      });
    });
  });
});

describe("getAllSpritesData", () => {
  const { getAllSpritesData } = mapRenderSelectors;
  describe("correct data for 12,12 when directionViewMode enabled", () => {
    var state = makeState(singleFloor, 1);
    state.selection.directionViewMode = true;
    var sprites = getAllSpritesData(state, { tileId: "12,12" });
    test("should have all the keys including directionality ssprites if directionViewMode enabled", () => {
      // main sprite, digit sprites, direction sprites, centre sprite
      [
        "main",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "top",
        "bottom",
        "centre"
      ].forEach(key => expect(sprites).toHaveProperty(key));
    });
    test("centre sprite should have name, x, y, xScale, yScale", () => {
      ["name", "x", "y", "xScale", "yScale"].forEach(key =>
        expect(sprites["centre"]).toHaveProperty(key)
      );
    });
  });
  describe("correct data for 12,12 when directionViewMode DISABLED", () => {
    var state = makeState(singleFloor, 1);
    state.selection.directionViewMode = false;
    var sprites = getAllSpritesData(state, { tileId: "12,12" });
    test("should not have directionality sprites", () => {
      expect(sprites).not.toHaveProperty("top");
      expect(sprites).not.toHaveProperty("bottom");
      expect(sprites).not.toHaveProperty("left");
      expect(sprites).not.toHaveProperty("right");
    });
  });
});
