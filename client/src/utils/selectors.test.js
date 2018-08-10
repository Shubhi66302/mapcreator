import * as selectors from "./selectors";
import * as constants from "../constants";
import { normalizeMap } from "./normalizr";
import sampleMapObj from "test-data/test-maps/3x3-with-pps-charger-fireemergencies.json";
// using immutable to correctly mutate mapJson
// we're not actually using mutation in state/main code, it's quite complicated to use
// https://redux.js.org/recipes/usingimmutablejs#what-are-the-issues-with-using-immutable-js
import { fromJS } from "immutable";
var makeState = (immutableMap, currentFloor = 1, selectedTiles = {}) => ({
  normalizedMap: normalizeMap(immutableMap.toJS()),
  currentFloor,
  selectedTiles,
  zoneView: false
});

var singleFloor = fromJS(sampleMapObj);
var twoFloors = singleFloor.updateIn(["map", "floors"], floors => [
  ...floors,
  {
    floor_id: 2,
    map_values: [
      {
        blocked: false,
        zone: "defzone",
        coordinate: "15,12",
        store_status: 0,
        barcode: "012.015",
        neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
        size_info: [750, 750, 750, 750],
        botid: "null"
      },
      {
        blocked: false,
        zone: "defzone",
        coordinate: "11,17",
        store_status: 0,
        barcode: "017.013",
        neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
        size_info: [750, 750, 750, 750],
        botid: "null"
      }
    ]
  }
]);

describe("tileIdsSelector", () => {
  test("should get 8 out of 9 barcodes since sampleMapJson has one special", () => {
    var state = makeState(singleFloor);
    var tileIds = selectors.tileIdsSelector(state);
    expect(tileIds).toHaveLength(8);
    expect(tileIds.find(e => e === "12,12")).not.toBeTruthy();
  });
  test("should get 8 barcodes on first floor of 2 floor map", () => {
    var state = makeState(twoFloors, 1);
    var tileIds = selectors.tileIdsSelector(state);
    expect(tileIds).toHaveLength(8);
    expect(tileIds.find(e => e === "15,12")).not.toBeTruthy();
  });
  test("should get 2 barcode when on 2nd floor of 2 floor map", () => {
    var state = makeState(twoFloors, 2);
    var tileIds = selectors.tileIdsSelector(state);
    expect(tileIds).toHaveLength(2);
    expect(tileIds).toEqual(["15,12", "11,17"]);
  });
  test("should not be recomputed when called twice", () => {
    selectors.tileIdsSelector.resetRecomputations();
    var state = makeState(twoFloors, 1);
    selectors.tileIdsSelector(state);
    expect(selectors.tileIdsSelector.recomputations()).toBe(1);
    selectors.tileIdsSelector(state);
    expect(selectors.tileIdsSelector.recomputations()).toBe(1);
  });
});

describe("tileBoundsSelector", () => {
  test("should give min (0,0) and max (2,2) for first floor", () => {
    var state = makeState(twoFloors, 1);
    var tileBounds = selectors.tileBoundsSelector(state);
    expect(tileBounds).toEqual({
      maxX: 2,
      maxY: 2,
      minX: 0,
      minY: 0
    });
  });
  test("should give min and max as (11,12) and (15,17)", () => {
    var state = makeState(twoFloors, 2);
    var tileBounds = selectors.tileBoundsSelector(state);
    expect(tileBounds).toEqual({
      maxX: 15,
      maxY: 17,
      minX: 11,
      minY: 12
    });
  });
  test("should not recompute when called twice with same state", () => {
    selectors.tileBoundsSelector.resetRecomputations();
    var state = makeState(twoFloors, 1);
    selectors.tileBoundsSelector(state);
    expect(selectors.tileBoundsSelector.recomputations()).toBe(1);
    selectors.tileBoundsSelector(state);
    expect(selectors.tileBoundsSelector.recomputations()).toBe(1);
  });
});

describe("tileRenderCoordinateSelector", () => {
  const { tileRenderCoordinateSelector } = selectors;
  test("should give correct render coordinate for a floor 1 tile", () => {
    var state = makeState(twoFloors, 1);
    var coordinates = tileRenderCoordinateSelector(state, { tileId: "0,0" });
    expect(coordinates).toEqual({ x: -0, y: 0 });
    coordinates = tileRenderCoordinateSelector(state, { tileId: "2,2" });
    expect(coordinates).toEqual({
      x: -2 * constants.TILE_WIDTH,
      y: 2 * constants.TILE_HEIGHT
    });
    coordinates = tileRenderCoordinateSelector(state, { tileId: "1,2" });
    expect(coordinates).toEqual({
      x: -1 * constants.TILE_WIDTH,
      y: 2 * constants.TILE_HEIGHT
    });
  });
  test("should give correct render coordinates for a 2nd floor tile", () => {
    var state = makeState(twoFloors, 2);
    var coordinates = tileRenderCoordinateSelector(state, { tileId: "11,17" });
    expect(coordinates).toEqual({ x: -0, y: 5 * constants.TILE_HEIGHT });
    coordinates = tileRenderCoordinateSelector(state, { tileId: "15,12" });
    expect(coordinates).toEqual({ x: -4 * constants.TILE_WIDTH, y: 0 });
  });
});

// remember, 000.001 => 1,0
describe("findTileIdInObj helper", () => {
  const findTileIdInObj = selectors.findTileIdInObj;
  var aPPSMap = { "1": { location: "000.001" }, "2": { location: "002.004" } };
  var aODSExcludedMap = {
    "1": { ods_tuple: "000.001--2" },
    "2": { ods_tuple: "002.004--1" }
  };
  test("should get tileId from a pps obj", () => {
    var found = findTileIdInObj(aPPSMap, e => e.location, "1,0");
    expect(found).toBe(true);
  });
  test("should not file tileId in pps obj", () => {
    var found = findTileIdInObj(aPPSMap, e => e.location, "5,6");
    expect(found).toBe(false);
  });
  test("should not find tileId in undefined obj", () => {
    var found = findTileIdInObj(undefined, e => e.location, "0,1");
  });
  test("should find tileId in ods map", () => {
    var found = findTileIdInObj(
      aODSExcludedMap,
      e => e.ods_tuple.slice(0, 7),
      "4,2"
    );
    expect(found).toBe(true);
  });
});

describe("findTileIdInQueueData helper", () => {
  const findTileIdInQueueData = selectors.findTileIdInQueueData;
  var aQueueDataMap = {
    "1": [["000.001", 0], ["002.004", 1]],
    "2": [["003.004", 1], ["005.006", 3]]
  };
  test("should find tileId in queue data", () => {
    var found = findTileIdInQueueData(aQueueDataMap, "4,2");
    expect(found).toBe(true);
    found = findTileIdInQueueData(aQueueDataMap, "4,3");
    expect(found).toBe(true);
  });
  test("should not find tileId in queue data", () => {
    var found = findTileIdInQueueData(aQueueDataMap, "0,2");
    expect(found).toBe(false);
  });
  test("should not find tileId in undefined obj", () => {
    var found = findTileIdInQueueData(undefined, "0,0");
    expect(found).toBe(false);
  });
});

// hard to test
describe("tileSpritesSelector", () => {
  const tileSpritesSelector = selectors.tileSpritesSelector;
  test("should give normal tile", () => {
    var state = makeState(twoFloors, 1);
    var sprites = tileSpritesSelector(state, { tileId: "1,2" });
    expect(sprites).toEqual([
      constants.NORMAL,
      "0.png",
      "0.png",
      "2.png",
      "dot.png",
      "0.png",
      "0.png",
      "1.png"
    ]);
  });
  test("should give pps tile", () => {
    var state = makeState(twoFloors, 1);
    var sprites = tileSpritesSelector(state, { tileId: "1,0" });
    expect(sprites).toEqual([
      constants.PPS,
      "0.png",
      "0.png",
      "0.png",
      "dot.png",
      "0.png",
      "0.png",
      "1.png"
    ]);
  });
  test("should give charger tile", () => {
    var state = makeState(twoFloors, 1);
    var sprites = tileSpritesSelector(state, { tileId: "2,2" });
    expect(sprites).toEqual([
      constants.CHARGER,
      "0.png",
      "0.png",
      "2.png",
      "dot.png",
      "0.png",
      "0.png",
      "2.png"
    ]);
  });
  test("should give selected tile", () => {
    var state = makeState(twoFloors, 1, {
      "2,1": {},
      "1,0": {}
    });
    var sprites = tileSpritesSelector(state, { tileId: "2,1" });
    expect(sprites).toEqual([
      constants.SELECTED,
      "0.png",
      "0.png",
      "1.png",
      "dot.png",
      "0.png",
      "0.png",
      "2.png"
    ]);
    sprites = tileSpritesSelector(state, { tileId: "1,0" });
    expect(sprites).toEqual([
      constants.SELECTED,
      "0.png",
      "0.png",
      "0.png",
      "dot.png",
      "0.png",
      "0.png",
      "1.png"
    ]);
  });
});

describe("tileDataSelector", () => {
  const tileDataSelector = selectors.tileDataSelector;
  test("should give correct tile data in shallow check", () => {
    // shallow checking this method
    var result = tileDataSelector.resultFunc(
      ["0.png", "0.png", "0.png", "dot.png", "0.png", "1.png", "2.png"],
      { x: 10, y: 20 }
    );
    expect(result).toMatchObject({
      spriteNames: [
        "0.png",
        "0.png",
        "0.png",
        "dot.png",
        "0.png",
        "1.png",
        "2.png"
      ],
      x: 10,
      y: 20
    });
  });
});

describe("makeTileSpriteDataSelector", () => {
  const {
    makeTileSpriteDataSelector,
    tileRenderCoordinateSelector
  } = selectors;
  test("should give correct coords for main sprite", () => {
    var state = makeState(twoFloors, 1);
    var result = makeTileSpriteDataSelector()(state, {
      tileId: "1,2",
      spriteIdx: 0
    });
    expect(result).toMatchObject({
      spriteName: constants.NORMAL,
      ...tileRenderCoordinateSelector(state, { tileId: "1,2" })
    });
  });
  test("should give correct coords for dot sprite", () => {
    var state = makeState(twoFloors, 1);
    var result = makeTileSpriteDataSelector()(state, {
      tileId: "1,2",
      spriteIdx: 4
    });
    var { x: tileX, y: tileY } = tileRenderCoordinateSelector(state, {
      tileId: "1,2"
    });
    expect(result).toMatchObject({
      spriteName: "dot.png",
      x: tileX + constants.BARCODE_SPRITE_X_OFFSET * 3,
      y: tileY + constants.BARCODE_SPRITE_Y_OFFSET
    });
  });
  test("make 2 instances with diff props and ensure they are not recomputed", () => {
    var state = makeState(twoFloors, 1);
    var selector1 = makeTileSpriteDataSelector();
    var selector2 = makeTileSpriteDataSelector();
    selector1(state, { tileId: "1,2", spriteIdx: 4 });
    selector2(state, { tileId: "1,2", spriteIdx: 0 });
    selector1(state, { tileId: "1,2", spriteIdx: 4 });
    selector2(state, { tileId: "1,2", spriteIdx: 0 });
    expect(selector1.recomputations()).toBe(1);
    expect(selector2.recomputations()).toBe(1);
  });
});
