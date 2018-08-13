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

describe("spriteRenderCoordinateSelector", () => {
  const {
    spriteRenderCoordinateSelector,
    tileRenderCoordinateSelector
  } = selectors;
  test("should give correct render coordinate for main sprite of floor 1", () => {
    var state = makeState(twoFloors, 1);
    var coordinates = spriteRenderCoordinateSelector(state, {
      tileId: "0,0",
      spriteIdx: 0
    });
    expect(coordinates).toEqual({ x: -0, y: 0 });
    coordinates = spriteRenderCoordinateSelector(state, {
      tileId: "2,2",
      spriteIdx: 0
    });
    expect(coordinates).toEqual(
      tileRenderCoordinateSelector(state, { tileId: "2,2" })
    );
    coordinates = spriteRenderCoordinateSelector(state, {
      tileId: "1,2",
      spriteIdx: 0
    });
    expect(coordinates).toEqual(
      tileRenderCoordinateSelector(state, { tileId: "1,2" })
    );
  });
  test("should give correct coordinate for a barcode sprite", () => {
    var state = makeState(twoFloors, 1);
    var coordinates = spriteRenderCoordinateSelector(state, {
      tileId: "0,0",
      spriteIdx: 1
    });
    expect(coordinates).toEqual({
      x: 0,
      y: constants.BARCODE_SPRITE_Y_OFFSET
    });
    coordinates = spriteRenderCoordinateSelector(state, {
      tileId: "2,2",
      spriteIdx: 4
    });
    expect(coordinates).toEqual({
      x: -2 * constants.TILE_WIDTH + 3 * constants.BARCODE_SPRITE_X_OFFSET,
      y: 2 * constants.TILE_HEIGHT + constants.BARCODE_SPRITE_Y_OFFSET
    });
  });
});

describe("tileNameWithoutEntityDataSelector", () => {
  const { tileNameWithoutEntityDataSelector } = selectors;
  test("should give correct tile name without entity info", () => {
    var state = makeState(twoFloors, 1);
    expect(tileNameWithoutEntityDataSelector(state, { tileId: "2,0" })).toBe(
      constants.STORABLE
    );
    expect(tileNameWithoutEntityDataSelector(state, { tileId: "1,0" })).toBe(
      constants.NORMAL
    );
    expect(tileNameWithoutEntityDataSelector(state, { tileId: "1,2" })).toBe(
      constants.NORMAL
    );
  });
});

describe("tileSpriteNamesWithoutEntityData", () => {
  const { tileSpriteNamesWithoutEntityData } = selectors;
  test("should give correct barcode sprite names for normal tile", () => {
    var state = makeState(twoFloors, 1);
    var sprites = tileSpriteNamesWithoutEntityData(state, { tileId: "1,2" });
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
  test("should give correct barcode sprite names for storable tile", () => {
    var state = makeState(twoFloors, 1);
    var sprites = tileSpriteNamesWithoutEntityData(state, { tileId: "2,0" });
    expect(sprites).toEqual([
      constants.STORABLE,
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

describe("getParticularEntityMap", () => {
  const { getParticularEntityMap } = selectors;
  test("should get correct entity map for ppses", () => {
    var state = makeState(twoFloors, 1);
    var entityMap = getParticularEntityMap(state, { entityName: "pps" });
    expect(entityMap).toMatchObject({
      "1,0": constants.PPS,
      "1,1": constants.PPS
    });
  });
  test("should get correct entity map for fire emergency", () => {
    var state = makeState(twoFloors, 1);
    var entityMap = getParticularEntityMap(state, {
      entityName: "fireEmergency"
    });
    expect(entityMap).toMatchObject({
      "0,2": constants.EMERGENCY_EXIT,
      "0,1": constants.EMERGENCY_EXIT
    });
  });
  test("should not recompute entities even alternating betweeen them", () => {
    // using re-reselect so shouldn't recompute
    var state = makeState(twoFloors, 1);
    var ppsSelector = getParticularEntityMap.getMatchingSelector(state, {
      entityName: "pps"
    });
    var fireEmergencySelector = getParticularEntityMap.getMatchingSelector(
      state,
      { entityName: "fireEmergency" }
    );
    ppsSelector.resetRecomputations();
    fireEmergencySelector.resetRecomputations();
    getParticularEntityMap(state, { entityName: "pps" });
    getParticularEntityMap(state, { entityName: "pps" });
    getParticularEntityMap(state, { entityName: "pps" });
    getParticularEntityMap(state, { entityName: "pps" });
    getParticularEntityMap(state, { entityName: "fireEmergency" });
    getParticularEntityMap(state, { entityName: "pps" });
    getParticularEntityMap(state, { entityName: "fireEmergency" });
    expect(ppsSelector.recomputations()).toBe(1);
    expect(fireEmergencySelector.recomputations()).toBe(1);
  });
});
// TODO: test getQueueMap

describe("specialTileSpritesMapSelector", () => {
  const { specialTileSpritesMapSelector } = selectors;
  test("should give correct map for 3x3 test map with no selected tiles", () => {
    var state = makeState(twoFloors, 1);
    var specialMap = specialTileSpritesMapSelector(state);
    expect(specialMap).toMatchObject({
      "2,2": constants.CHARGER,
      "0,2": constants.EMERGENCY_EXIT,
      "0,1": constants.EMERGENCY_EXIT,
      "1,0": constants.PPS,
      "1,1": constants.PPS
    });
  });
  test("should give correct map for 3x3 test map with some selected tiles", () => {
    var state = makeState(twoFloors, 1, { "2,2": {}, "2,0": {} });
    var specialMap = specialTileSpritesMapSelector(state);
    expect(specialMap).toMatchObject({
      "2,2": constants.SELECTED,
      "0,2": constants.EMERGENCY_EXIT,
      "0,1": constants.EMERGENCY_EXIT,
      "1,0": constants.PPS,
      "1,1": constants.PPS,
      "2,0": constants.SELECTED
    });
  });
});
//
// describe("findTileIdInQueueData helper", () => {
//   const findTileIdInQueueData = selectors.findTileIdInQueueData;
//   var aQueueDataMap = {
//     "1": [["000.001", 0], ["002.004", 1]],
//     "2": [["003.004", 1], ["005.006", 3]]
//   };
//   test("should find tileId in queue data", () => {
//     var found = findTileIdInQueueData(aQueueDataMap, "4,2");
//     expect(found).toBe(true);
//     found = findTileIdInQueueData(aQueueDataMap, "4,3");
//     expect(found).toBe(true);
//   });
//   test("should not find tileId in queue data", () => {
//     var found = findTileIdInQueueData(aQueueDataMap, "0,2");
//     expect(found).toBe(false);
//   });
//   test("should not find tileId in undefined obj", () => {
//     var found = findTileIdInQueueData(undefined, "0,0");
//     expect(found).toBe(false);
//   });
// });
