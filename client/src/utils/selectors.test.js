import * as selectors from "./selectors";
import * as constants from "../constants";
import { tileToWorldCoordinate } from "./util";
import {
  makeState,
  singleFloor,
  twoFloors,
  singleFloorVanilla
} from "./test-helper";
import { fromJS } from "immutable";

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

describe("coordinateKeyToBarcodeSelector", () => {
  const { coordinateKeyToBarcodeSelector } = selectors;
  test("should give correct barcode for a tile id", () => {
    var state = makeState(twoFloors, 2);
    var barcodeString = coordinateKeyToBarcodeSelector(state, {
      tileId: "15,12"
    });
    expect(barcodeString).toBe("012.015");
  });
  test("should give correct barcode for tile id when barcode string != tile id", () => {
    var state = makeState(twoFloors, 2);
    var barcodeString = coordinateKeyToBarcodeSelector(state, {
      tileId: "11,17"
    });
    expect(barcodeString).toBe("017.013");
  });
});

describe("currentFloorBarcodeToCoordinateMap", () => {
  const { currentFloorBarcodeToCoordinateMap } = selectors;
  test("should compute a correct map for current floor barcodes", () => {
    var state = makeState(twoFloors, 2);
    var barcodeToCoordinateMap = currentFloorBarcodeToCoordinateMap(state);
    expect(barcodeToCoordinateMap).toMatchObject({
      "012.015": "15,12",
      "017.013": "11,17"
    });
  });
  test("should not recompute on repeated calls", () => {
    var state = makeState(twoFloors, 2);
    currentFloorBarcodeToCoordinateMap.resetRecomputations();
    // it's a single argument call, but adding a second argument shouldn't change things
    currentFloorBarcodeToCoordinateMap(state);
    currentFloorBarcodeToCoordinateMap(state, { barcode: "something" });
    currentFloorBarcodeToCoordinateMap(state, { barcode: "somethingelse" });
    currentFloorBarcodeToCoordinateMap(state, { notused: "ok" });
    expect(currentFloorBarcodeToCoordinateMap.recomputations()).toBe(1);
  });
});

describe("barcodeToCoordinateKeySelector", () => {
  const { barcodeToCoordinateKeySelector } = selectors;
  test("should give correct coordinate for a barcode string", () => {
    var state = makeState(twoFloors, 2);
    var coordinate = barcodeToCoordinateKeySelector(state, {
      barcode: "012.015"
    });
    expect(coordinate).toBe("15,12");
  });
  test("should give correct coordinate when barcode does not match coordinate", () => {
    var state = makeState(twoFloors, 2);
    var coordinate = barcodeToCoordinateKeySelector(state, {
      barcode: "017.013"
    });
    expect(coordinate).toBe("11,17");
  });
  test("should return undefined when querying for a barcode that doesn't exist on current floor", () => {
    var state = makeState(twoFloors, 1);
    var coordinate = barcodeToCoordinateKeySelector(state, {
      barcode: "012.015"
    });
    expect(coordinate).toBeUndefined();
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
  test("should not recompute entities even when alternating betweeen them", () => {
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

describe("getQueueMap", () => {
  const { getQueueMap } = selectors;
  var twoFloorsWithQueueData = twoFloors.setIn(
    ["map", "queueDatas"],
    [
      {
        queue_data_id: 1,
        coordinates: ["1,0", "2,0"],
        data: [["001.000", 0], ["000.002", 4]]
      }
    ]
  );
  test("should get correct queue map for queues", () => {
    var state = makeState(twoFloorsWithQueueData, 1);
    var queueMap = getQueueMap(state);
    expect(queueMap).toMatchObject({
      "1,0": constants.QUEUE,
      "2,0": constants.QUEUE
    });
  });
  test("should be empty map when there is no queue data", () => {
    var state = makeState(twoFloors, 1);
    var queueMap = getQueueMap(state);
    expect(queueMap).toMatchObject({});
  });
  test("should not recompute on multiple calls with same state", () => {
    var state = makeState(twoFloorsWithQueueData, 1);
    getQueueMap.resetRecomputations();
    getQueueMap(state);
    getQueueMap(state);
    getQueueMap(state);
    expect(getQueueMap.recomputations()).toBe(1);
  });
});

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

// TODO: test for getChargerEntryMap

describe("getIdsForNewEntities", () => {
  const { getIdsForNewEntities } = selectors;
  test("should give new ids for entities when no entity exists before", () => {
    var state = makeState(singleFloorVanilla, 1);
    var newEntities = [
      {
        coordinate: "1,1",
        data: "hello"
      },
      {
        coordinate: "2,2",
        data: "world"
      }
    ];
    var ids = getIdsForNewEntities(state, { entityName: "pps", newEntities });
    expect(ids).toEqual([1, 2]);
  });
  test("should give new ids for entities when some entities with no common coordinates existed before", () => {
    var singleFloorVanillaWithPPSes = singleFloorVanilla.updateIn(
      ["map", "floors", 0, "ppses"],
      (ppses = []) =>
        fromJS([
          ...ppses,
          {
            pps_id: 1,
            coordinate: "1,1",
            data: "hello"
          }
        ])
    );
    var state = makeState(singleFloorVanillaWithPPSes, 1);
    var newEntities = [
      {
        coordinate: "2,2",
        data: "world"
      },
      {
        coordinate: "3,3",
        data: "world2"
      }
    ];
    var ids = getIdsForNewEntities(state, { entityName: "pps", newEntities });
    expect(ids).toEqual([2, 3]);
  });
  test("should give correct some new and some old ids for entities when an entity with common coordinate existed before", () => {
    var singleFloorVanillaWithPPSes = singleFloorVanilla.updateIn(
      ["map", "floors", 0, "ppses"],
      (ppses = []) => [
        ...ppses,
        {
          pps_id: 1,
          coordinate: "1,1",
          data: "hello"
        },
        {
          pps_id: 2,
          coordinate: "2,3",
          data: "world"
        }
      ]
    );
    var state = makeState(singleFloorVanillaWithPPSes, 1);
    var newEntities = [
      {
        coordinate: "4,5",
        data: "newdata2"
      },
      {
        coordinate: "5,6",
        data: "newdata3"
      },
      {
        coordinate: "1,1",
        data: "newdata4"
      }
    ];
    // order is important
    var ids = getIdsForNewEntities(state, { entityName: "pps", newEntities });
    expect(ids).toEqual([3, 4, 1]);
  });
});

describe("specialBarcodesCoordinateSelector", () => {
  const { specialBarcodesCoordinateSelector } = selectors;
  test("should give empty array if no specialc coordinates", () => {
    var state = makeState(singleFloorVanilla, 1);
    var coordinateKeys = specialBarcodesCoordinateSelector(state);
    expect(coordinateKeys).toHaveLength(0);
  });
  test("should give special barcodes even if special barcodes are on different floor", () => {
    var twoFloorsWithMoreSpecialCoordinates = twoFloors.updateIn(
      ["map", "floors", 1, "map_values"],
      (map_values = []) =>
        fromJS([
          ...map_values,
          {
            coordinate: "500,500",
            special: true
          }
        ])
    );
    var state = makeState(twoFloorsWithMoreSpecialCoordinates, 2);
    var coordinateKeys = specialBarcodesCoordinateSelector(state);
    expect(coordinateKeys).toEqual(["12,12", "500,500"]);
  });
});

describe("getNewSpecialCoordinates", () => {
  const { getNewSpecialCoordinates } = selectors;
  test("shoudl give 500,500 if no special barcode yet", () => {
    var state = makeState(singleFloorVanilla, 1);
    var maxCoordinate = getNewSpecialCoordinates(state, { n: 3 });
    expect(maxCoordinate).toEqual(["500,500", "501,501", "502,502"]);
  });
  // this singleFloor map is incorrect as special barcode coordinate was calculate with old logic
  // still using it for testing
  test("should give correct special max coordinate if some special barcodes already exist", () => {
    var state = makeState(singleFloor, 1);
    var maxCoordinate = getNewSpecialCoordinates(state, { n: 2 });
    expect(maxCoordinate).toEqual(["13,13", "14,14"]);
  });
});

describe("distanceTileSpritesSelector", () => {
  const { distanceTileSpritesSelector } = selectors;
  // TODO: better tests that check if rects are correct
  test("should give correct number of distance tiles", () => {
    var state = makeState(singleFloorVanilla, 1);
    var distanceTilesArr = distanceTileSpritesSelector(state);
    expect(distanceTilesArr).toHaveLength(4);
    // should have key property
    distanceTilesArr.forEach((distanceTile, idx) => {
      expect(distanceTile).toHaveProperty("key");
      expect(distanceTile.key).toBe(idx);
    });
  });
});
