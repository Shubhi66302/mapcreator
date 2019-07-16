import * as distanceTileSelectors from "./distance-tile-selectors";
import { makeState, singleFloor, singleFloorVanilla } from "../test-helper";

describe("getDistinctXAndYDistances", () => {
  const { getDistinctXAndYDistances } = distanceTileSelectors;
  test("should return distinct distances in x and y direction in sorted order, when no special barcode present in map", () => {
    var state = makeState(singleFloorVanilla, 1);
    var xAndYDistances = getDistinctXAndYDistances(state);
    expect(xAndYDistances.x).toEqual([0, -1500, -3000]);
    expect(xAndYDistances.y).toEqual([0, 1500, 3000]);
  });
  test("should return distinct distances in x and y direction in sorted order, when special barcode present in map", () => {
    var state = makeState(singleFloor, 1);
    var xAndYDistances = getDistinctXAndYDistances(state);
    expect(xAndYDistances.x).toEqual([1500, 0, -1500]);
    expect(xAndYDistances.y).toEqual([0, 1500, 2590, 3000]);
  });
});

describe("distanceTileSpritesSelector", () => {
  const { distanceTileSpritesSelector } = distanceTileSelectors;
  // TODO: better tests that check if rects are correct
  test("should give correct number of distance tiles", () => {
    var state = makeState(singleFloorVanilla, 1);
    var distanceTilesArr = distanceTileSpritesSelector(state);
    expect(distanceTilesArr).toHaveLength(6);
    // should have key property
    distanceTilesArr.forEach(distanceTile => {
      expect(distanceTile).toHaveProperty("key");
    });
  });
});

describe("getRowColumnInBetweenDistancesAndCoordinates", () => {
  const {
    getRowColumnInBetweenDistancesAndCoordinates
  } = distanceTileSelectors;
  test("should give correct distances when no special tile id in between", () => {
    var state = makeState(singleFloorVanilla, 1); // 3 columns and 3 rows
    const inBetweenDistances = getRowColumnInBetweenDistancesAndCoordinates(
      state
    );
    // Total in between distances => 2 (bw 3 columns) + 2 (bw 3 rows)
    for (var i = 0; i < 4; i++) {
      expect(inBetweenDistances[i].distance).toEqual(1500);
      expect(inBetweenDistances[i]).toHaveProperty("x");
      expect(inBetweenDistances[i]).toHaveProperty("y");
    }
    // TODO: can add test cases to match coordinate of a distance tile
  });
  test("Should give correct distances when there is a special barcode (charger entry) in between some tiles", () => {
    var state = makeState(singleFloor, 1); // 3 columns and 4 rows (one special coordinate)
    const inBetweenDistances = getRowColumnInBetweenDistancesAndCoordinates(
      state
    );
    // Total in between distances => 2 (bw 3 columns) + 3 (bw 4 rows)
    const allInBetweenDistances = [1500, 1500, 1500, 1090, 410];
    for (var i = 0; i < 5; i++) {
      expect(inBetweenDistances[i].distance).toEqual(allInBetweenDistances[i]);
    }
  });
});

describe("getAllColumnTileIdTuples", () => {
  const { getAllColumnTileIdTuples } = distanceTileSelectors;
  test("should give correct list of tileId when selecting a edge column", () => {
    var state = makeState(singleFloorVanilla, 1);
    var arrOfTuples = getAllColumnTileIdTuples(state, "c-0");
    expect(arrOfTuples).toEqual(["0,0", "0,1", "0,2"]);
  });
  test("should give correct list of tileId when selecting a normal column", () => {
    var state = makeState(singleFloorVanilla, 1);
    var arrOfTuples = getAllColumnTileIdTuples(state, "c-1");
    expect(arrOfTuples).toEqual(["1,0", "1,1", "1,2"]);
  });
});

describe("getAllRowTileIdTuples", () => {
  const { getAllRowTileIdTuples } = distanceTileSelectors;
  test("should give correct list of tileId when selecting a edge row", () => {
    var state = makeState(singleFloorVanilla, 1);
    var arrOfTuples = getAllRowTileIdTuples(state, "r-0");
    expect(arrOfTuples).toEqual(["0,0", "1,0", "2,0"]);
  });
  test("should give correct list of tileId when selecting a normal row", () => {
    var state = makeState(singleFloorVanilla, 1);
    var arrOfTuples = getAllRowTileIdTuples(state, "r-1");
    expect(arrOfTuples).toEqual(["0,1", "1,1", "2,1"]);
  });
  test("should give correct list of tileIds when selecting a row which have special barcode", () => {
    var state = makeState(singleFloor);
    var arrOfTuples = getAllRowTileIdTuples(state, "r-2");
    expect(arrOfTuples).toEqual(["12,12"]);
  });
});
