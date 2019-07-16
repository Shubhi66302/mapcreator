import * as selectors from "./index";
import * as constants from "../../constants";
import {
  makeState,
  singleFloor,
  twoFloors,
  singleFloorVanilla
} from "../test-helper";
import { fromJS } from "immutable";

describe("tileIdsMapSelector", () => {
  const { tileIdsMapSelector } = selectors;
  test("should get 9 out of 9 barcodes for first floor", () => {
    var state = makeState(twoFloors);
    var tileIdsMap = tileIdsMapSelector(state);
    expect(tileIdsMap).toEqual({
      "1,0": true,
      "1,1": true,
      "1,2": true,
      "12,12": true,
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
  test("should not recompute when called twice", () => {
    var state = makeState(twoFloors, 1);
    tileIdsMapSelector.resetRecomputations();
    tileIdsMapSelector(state);
    tileIdsMapSelector(state);
    tileIdsMapSelector(state);
    expect(tileIdsMapSelector.recomputations()).toBe(1);
  });
});

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
  test("should give correct entity ids when uniqueKey is provided", () => {
    var singleFloorVanillaWithOdsExcludeds = singleFloorVanilla.updateIn(
      ["map", "floors", 0, "odsExcludeds"],
      (odsExcludeds = []) => [
        ...odsExcludeds,
        {
          coordinate: "1,1",
          ods_excluded_id: 1,
          excluded: true,
          ods_tuple: "001.001--0"
        },
        {
          coordinate: "2,1",
          ods_excluded_id: 2,
          excluded: true,
          ods_tuple: "002.001--1"
        }
      ]
    );
    var state = makeState(singleFloorVanillaWithOdsExcludeds, 1);
    var newEntities = [
      {
        coordinate: "1,1",
        excluded: true,
        ods_tuple: "001.001--1"
      },
      {
        coordinate: "1,1",
        excluded: true,
        ods_tuple: "001.001--0"
      },
      {
        coordinate: "2,2",
        excluded: true,
        ods_tuple: "002.002--1"
      }
    ];
    // order is important
    var ids = getIdsForNewEntities(state, {
      entityName: "odsExcluded",
      newEntities,
      uniqueKey: "ods_tuple"
    });
    expect(ids).toEqual([3, 1, 4]);
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
    var specialCoordinates = getNewSpecialCoordinates(state, { n: 3 });
    expect(specialCoordinates).toEqual(["500,500", "501,501", "502,502"]);
  });
  test("should give more barcodes if 500,500 already exists", () => {
    // adding a special barcode
    var singleFloorWithSpecial = singleFloor.updateIn(
      ["map", "floors", 0, "map_values"],
      (map_values = []) =>
        fromJS([
          ...map_values,
          {
            blocked: false,
            zone: "defzone",
            coordinate: "500,500",
            special: true,
            store_status: 0,
            barcode: "500.500",
            neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
            size_info: [750, 750, 750, 750],
            botid: "null"
          }
        ])
    );
    var state = makeState(singleFloorWithSpecial);
    var specialCoordinates = getNewSpecialCoordinates(state, { n: 2 });
    expect(specialCoordinates).toEqual(["501,501", "502,502"]);
  });
  // this singleFloor map is incorrect as special barcode coordinate was calculate with old logic
  // still using it for testing
  test("should give correct special max coordinate if some special barcodes already exist", () => {
    var state = makeState(singleFloor, 1);
    var maxCoordinate = getNewSpecialCoordinates(state, { n: 2 });
    expect(maxCoordinate).toEqual(["500,500", "501,501"]);
  });
  test("should give some barcodes when the current max is 999.999, and some other specials already exist", () => {
    // adding a special barcodes
    // 999,999; 500,500; 502,502
    var singleFloorWithSpecial = singleFloor.updateIn(
      ["map", "floors", 0, "map_values"],
      map_values =>
        fromJS([
          ...map_values,
          {
            blocked: false,
            zone: "defzone",
            coordinate: "999,999",
            special: true,
            store_status: 0,
            barcode: "999.999",
            neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
            size_info: [750, 750, 750, 750],
            botid: "null"
          },
          {
            blocked: false,
            zone: "defzone",
            coordinate: "500,500",
            special: true,
            store_status: 0,
            barcode: "500.500",
            neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
            size_info: [750, 750, 750, 750],
            botid: "null"
          },
          {
            blocked: false,
            zone: "defzone",
            coordinate: "502,502",
            special: true,
            store_status: 0,
            barcode: "502.502",
            neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
            size_info: [750, 750, 750, 750],
            botid: "null"
          }
        ])
    );
    var state = makeState(singleFloorWithSpecial);
    var specialCoordinates = getNewSpecialCoordinates(state, { n: 3 });
    expect(specialCoordinates).toEqual(["501,501", "503,503", "504,504"]);
  });
});

describe("getMapName", () => {
  const { getMapName } = selectors;
  test("should give map name", () => {
    var state = makeState(singleFloorVanilla, 1);
    expect(getMapName(state)).toEqual("3x3-vanilla");
  });
});

describe("getMapId", () => {
  const { getMapId } = selectors;
  test("should give map id", () => {
    var state = makeState(singleFloorVanilla, 1);
    expect(getMapId(state)).toEqual(31);
  });
});

describe("getFitToSizeViewportRect", () => {
  const { getFitToSizeViewportRect } = selectors;
  // for boht maps have size  3000 * 3000 mm^2
  const xPadding = 3000 * constants.VIEWPORT_MAX_SIZE_PADDING_RATIO;
  const yPadding = 3000 * constants.VIEWPORT_MAX_SIZE_PADDING_RATIO;
  test("should return correct boundaries of viewport, when no special barcode present in map", () => {
    var state = makeState(singleFloorVanilla, 1);
    var viewPortCoordinates = getFitToSizeViewportRect(state);
    expect(viewPortCoordinates.top).toEqual(0 - yPadding);
    expect(viewPortCoordinates.bottom).toEqual(3000 + yPadding);
    expect(viewPortCoordinates.left).toEqual(-3000 - xPadding);
    expect(viewPortCoordinates.right).toEqual(0 + xPadding);
  });
  test("should return correct boundaries of viewport, when special barcode present in map", () => {
    var state = makeState(singleFloor, 1);
    var viewPortCoordinates = getFitToSizeViewportRect(state);
    expect(viewPortCoordinates.top).toEqual(0 - yPadding);
    expect(viewPortCoordinates.bottom).toEqual(3000 + yPadding);
    expect(viewPortCoordinates.left).toEqual(-1500 - xPadding);
    expect(viewPortCoordinates.right).toEqual(1500 + xPadding);
  });
});
