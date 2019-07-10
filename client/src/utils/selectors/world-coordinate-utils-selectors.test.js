import * as worldCoordinateUtils from "./world-coordinate-utils-selectors";
import {
  makeState,
  singleFloor
} from "../test-helper";

describe("getTileIdToWorldCoordMap", () => {
  const { getTileIdToWorldCoordMap} = worldCoordinateUtils;
  var state = makeState(singleFloor, 1);
  test("should give tile ids to world coordinate map", () => {
    const tileIdToWorldCoordinateMap = getTileIdToWorldCoordMap(state);
    const expectedTileIdToWorldCoordinateMap = {
      "1,0": { x: 0, y: 0 },
      "2,0": { x: -1500, y: 0 },
      "1,1": { x: 0, y: 1500 },
      "2,1": { x: -1500, y: 1500 },
      "1,2": { x: 0, y: 3000 },
      "2,2": { x: -1500, y: 3000 },
      "12,12": { x: -1500, y: 2590 },
      "0,1": { x: 1500, y: 1500 },
      "0,2": { x: 1500, y: 3000 }
    };
    expect(tileIdToWorldCoordinateMap).toEqual(expectedTileIdToWorldCoordinateMap);
  });
});

describe("getWorldCoordUsingNeighbour", () => {
  const { getWorldCoordUsingNeighbour} = worldCoordinateUtils;
  var barcodeSizeInfo = [750, 550, 450, 350];
  var neighbourWithWorldCoordinate ={
    direction: "0",
    worldcoordinate: {"x": 1500, "y": 1500},
    distanceInfo: [100, 200, 300, 400]
  };
  test("should give correct world coordinate using neighbour in direction 0", () => {
    const worldCoordinate = getWorldCoordUsingNeighbour(barcodeSizeInfo, neighbourWithWorldCoordinate);
    expect(worldCoordinate).toEqual({x: 1500, y: 2550});
  });
  test("should give correct world coordinate using neighbour in direction 1", () => {
    neighbourWithWorldCoordinate.direction = "1";
    const worldCoordinate = getWorldCoordUsingNeighbour(barcodeSizeInfo, neighbourWithWorldCoordinate);
    expect(worldCoordinate).toEqual({x: 550, y: 1500});
  });
  test("should give correct world coordinate using neighbour in direction 2", () => {
    neighbourWithWorldCoordinate.direction = "2";
    const worldCoordinate = getWorldCoordUsingNeighbour(barcodeSizeInfo, neighbourWithWorldCoordinate);
    expect(worldCoordinate).toEqual({x: 1500, y: 950});
  });
  test("should give correct world coordinate using neighbour in direction 3", () => {
    neighbourWithWorldCoordinate.direction = "3";
    const worldCoordinate = getWorldCoordUsingNeighbour(barcodeSizeInfo, neighbourWithWorldCoordinate);
    expect(worldCoordinate).toEqual({x: 2050, y: 1500});
  });
});

describe("tileToWorldCoordinate", () => {
  const { tileToWorldCoordinate, getTileIdToWorldCoordMap} = worldCoordinateUtils;
  var state = makeState(singleFloor, 1);
  const tileIdToWorldCoordinateMap = getTileIdToWorldCoordMap(state);
  test("should give correct world coordinate for non-special tile id", () => {
    const worldCoordinate = tileToWorldCoordinate("0,1", tileIdToWorldCoordinateMap);
    expect(worldCoordinate).toEqual({x: 1500, y: 1500});
  });
  test("should give correct world coordinate for special tile id", () => {
    const worldCoordinate = tileToWorldCoordinate("12,12", tileIdToWorldCoordinateMap);
    expect(worldCoordinate).toEqual({x: -1500, y: 2590});
  });
});

describe("worldToTileCoordinate", () => {
  const { worldToTileCoordinate } = worldCoordinateUtils;
  var state = makeState(singleFloor, 1);
  test("should give correct tile id when exact world coordinate is selected", () => {
    const tileId = worldToTileCoordinate(state, {x: 1500, y: 1500});
    expect(tileId).toEqual("0,1");
  });
  test("should give correct tile id exact world coordinate is selected, but intersects the tile size", () => {
    const tileId = worldToTileCoordinate(state, {x: 1400, y: 1300});
    expect(tileId).toEqual("0,1");
  });
  test("should return undefined when there is no tile on world world coordinate", () => {
    const tileId = worldToTileCoordinate(state, {x: 4500, y: 4500});
    expect(tileId).toEqual(undefined);
  });
});
