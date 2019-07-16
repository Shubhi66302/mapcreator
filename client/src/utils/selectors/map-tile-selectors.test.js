import * as mapTileSelectors from "./map-tile-selectors";
import * as constants from "../../constants";
import { makeState, twoFloors } from "../test-helper";

describe("tileNameWithoutEntityDataSelector", () => {
  const { tileNameWithoutEntityDataSelector } = mapTileSelectors;
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
  const { tileSpriteNamesWithoutEntityData } = mapTileSelectors;
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
      "1.png",
      "dot.png"
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
      "2.png",
      "dot.png"
    ]);
  });
});

describe("getParticularEntityMap", () => {
  const { getParticularEntityMap } = mapTileSelectors;
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
  const { getQueueMap } = mapTileSelectors;
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

// TODO: test for getChargerEntryMap

describe("specialTileSpritesMapSelector", () => {
  const { specialTileSpritesMapSelector } = mapTileSelectors;
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
