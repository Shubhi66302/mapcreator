import * as mapRenderSelectors from "./map-render-selectors";
import {
  tileToWorldCoordinate,
  getTileBoundingBox
} from "./world-coordinate-utils-selectors";
import { fromJS } from "immutable";
import { makeState, singleFloor, singleFloorVanilla } from "../test-helper";
import * as constants from "../../constants";

describe("spriteRenderCoordinateSelector", () => {
  const { spriteRenderCoordinateSelector } = mapRenderSelectors;
  test("should give correct render coordinate for main sprite of top left barcode", () => {
    var state = makeState(singleFloor, 1);
    var coordinates = spriteRenderCoordinateSelector(state, {
      tileId: "2,0",
      spriteIdx: 0
    });
    var worldCoordinate = tileToWorldCoordinate(state, { tileId: "2,0" });
    // Size of "2.0" is 1500
    var topLeftPointX =
      worldCoordinate.x - (1500 - constants.BARCODE_SPRITE_GAP) / 2;
    var topLeftPointY =
      worldCoordinate.y - (1500 - constants.BARCODE_SPRITE_GAP) / 2;
    expect(coordinates).toEqual({ x: topLeftPointX, y: topLeftPointY });
  });
  test("should give correct render coordinate for main sprite of bottom right barcode", () => {
    var state = makeState(singleFloor, 1);
    var coordinates = spriteRenderCoordinateSelector(state, {
      tileId: "0,2",
      spriteIdx: 0
    });
    var worldCoordinate = tileToWorldCoordinate(state, { tileId: "0,2" });
    var topLeftPointX =
      worldCoordinate.x - (1500 - constants.BARCODE_SPRITE_GAP) / 2;
    var topLeftPointY =
      worldCoordinate.y - (1500 - constants.BARCODE_SPRITE_GAP) / 2;
    expect(coordinates).toEqual({ x: topLeftPointX, y: topLeftPointY });
  });
  test("should give correct render coordinate for main sprite of special barcode", () => {
    var state = makeState(singleFloor, 1);
    var coordinates = spriteRenderCoordinateSelector(state, {
      tileId: "12,12",
      spriteIdx: 0
    });
    var worldCoordinate = tileToWorldCoordinate(state, { tileId: "12,12" });
    // TODO: should use barcode size instead of hardcoding ?
    var topLeftPointX =
      worldCoordinate.x - (1500 - constants.BARCODE_SPRITE_GAP) / 2;
    var topLeftPointY =
      worldCoordinate.y - 205 * ((1500 - constants.BARCODE_SPRITE_GAP) / 1500);
    expect(coordinates).toEqual({ x: topLeftPointX, y: topLeftPointY });
  });
  test("should give correct render coordinate for center dot sprite of a barcode", () => {
    var state = makeState(singleFloor, 1);
    var coordinates = spriteRenderCoordinateSelector(state, {
      tileId: "12,12",
      spriteIdx: 8
    });
    var worldCoordinate = tileToWorldCoordinate(state, { tileId: "12,12" });
    // TODO: should use barcode size instead of hardcoding ?
    expect(coordinates).toEqual({ x: worldCoordinate.x, y: worldCoordinate.y });
  });
});

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
