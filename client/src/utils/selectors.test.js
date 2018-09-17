import * as selectors from "./selectors";
import * as constants from "../constants";
import { tileToWorldCoordinate } from "./util";
import { makeState, singleFloor, twoFloors } from "./test-helper";

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

describe("tileIdsMapSelector", () => {
  const { tileIdsMapSelector } = selectors;
  test("should get 8 out of 9 barcodes for first floor", () => {
    var state = makeState(twoFloors);
    var tileIdsMap = tileIdsMapSelector(state);
    expect(tileIdsMap).toMatchObject({
      "1,0": true,
      "1,1": true,
      "1,2": true,
      "0,1": true,
      "0,2": true,
      "2,0": true,
      "2,1": true,
      "2,2": true
    });
  });
  test("should get both barcodes of second floor", () => {
    var state = makeState(twoFloors, 2);
    var tileIdsMap = tileIdsMapSelector(state);
    expect(tileIdsMap).toMatchObject({
      "15,12": true,
      "11,17": true
    });
  });
  test("should not recopute when called twice", () => {
    var state = makeState(twoFloors, 1);
    tileIdsMapSelector.resetRecomputations();
    tileIdsMapSelector(state);
    tileIdsMapSelector(state);
    tileIdsMapSelector(state);
    expect(tileIdsMapSelector.recomputations()).toBe(1);
  });
});

describe("coordinateKeyToBarcode", () => {
  const { coordinateKeyToBarcode } = selectors;
  test("should give correct barcode for a tile id", () => {
    var state = makeState(twoFloors, 2);
    var barcodeString = coordinateKeyToBarcode(state, { tileId: "15,12" });
    expect(barcodeString).toEqual("012.015");
  });
  test("should give correct barcode for tile id when barcode string != tile id", () => {
    var state = makeState(twoFloors, 2);
    var barcodeString = coordinateKeyToBarcode(state, { tileId: "11,17" });
    expect(barcodeString).toEqual("017.013");
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
    var tileBounds = selectors.tileBoundsSelector(state);
    var coordinates = tileRenderCoordinateSelector(state, { tileId: "0,0" });
    expect(coordinates).toEqual(tileToWorldCoordinate("0,0", tileBounds));
    coordinates = tileRenderCoordinateSelector(state, { tileId: "2,2" });
    expect(coordinates).toEqual(tileToWorldCoordinate("2,2", tileBounds));
    coordinates = tileRenderCoordinateSelector(state, { tileId: "1,2" });
    expect(coordinates).toEqual(tileToWorldCoordinate("1,2", tileBounds));
  });
  test("should give correct render coordinates for a 2nd floor tile", () => {
    var state = makeState(twoFloors, 2);
    var tileBounds = selectors.tileBoundsSelector(state);
    var coordinates = tileRenderCoordinateSelector(state, { tileId: "11,17" });
    expect(coordinates).toEqual(tileToWorldCoordinate("11,17", tileBounds));
    coordinates = tileRenderCoordinateSelector(state, { tileId: "15,12" });
    expect(coordinates).toEqual(tileToWorldCoordinate("15,12", tileBounds));
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
    expect(coordinates).toEqual(
      tileRenderCoordinateSelector(state, { tileId: "0,0" })
    );
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
  // TODO: write a good test for checking barcode string sprites positions
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

describe("getCurrentFloorMaxCoordinate", () => {
  const { getCurrentFloorMaxCoordinate } = selectors;
  test("should give correct max coordinate when no special barcode", () => {
    // 2nd floor does not have special barcode
    var state = makeState(twoFloors, 2);
    var maxTileCoordinate = getCurrentFloorMaxCoordinate(state);
    expect(maxTileCoordinate).toEqual([15, 17]);
  });
  test("should give correct max coordinate when there is special barcode", () => {
    var state = makeState(twoFloors, 1);
    var maxTileCoordinate = getCurrentFloorMaxCoordinate(state);
    expect(maxTileCoordinate).toEqual([12, 12]);
  });
  test("should not recompute", () => {
    var state = makeState(twoFloors, 1);
    getCurrentFloorMaxCoordinate.resetRecomputations();
    getCurrentFloorMaxCoordinate(state);
    getCurrentFloorMaxCoordinate(state);
    getCurrentFloorMaxCoordinate(state);
    expect(getCurrentFloorMaxCoordinate.recomputations()).toBe(1);
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
