require("dotenv").config({ path: ".env.test" });
import getLoadedAjv from "./get-loaded-ajv";
import importMap, { detectSingleFloor, getOdsExcludedBarcode } from "./import-map";
import continentalJsons from "test-data/test-jsons/maps/continental/all";
import continental2MapJson from "test-data/test-jsons/continental-2-map.json";
import threeSevenJsons from "test-data/test-jsons/maps/3-7/all";
import _ from "lodash";

var ajv = getLoadedAjv();
var mapValidate = ajv.getSchema("map");

describe("detectSingleFloor", () => {
  test("should detect single floor map (continental)", () => {
    expect(detectSingleFloor(continentalJsons.mapJson)).toBe(true);
    expect(detectSingleFloor(continental2MapJson)).toBe(true);
  });
  test("should be false for multi floor map (3-7 map)", () => {
    expect(detectSingleFloor(threeSevenJsons.mapJson)).toBe(false);
  });
});

// TODO: write tests for invalid imports
describe("import good maps", () => {
  test("import continental map with single floor style map.json", () => {
    var map = importMap(continentalJsons);
    var result = mapValidate(map);
    expect(mapValidate.errors).toBeNull();
    expect(result).toBe(true);
    // debug: log the map to a file. nevermind.
    // fs.writeFileSync("/tmp/map.json", JSON.stringify(map), "utf-8");
  });

  test("import 3-7 map", () => {
    var map = importMap(threeSevenJsons);
    var result = mapValidate(map);
    expect(mapValidate.errors).toBeNull();
    expect(result).toBe(true);
    expect(map.floors[0].fireEmergencies[0].fire_emergency_id).toBeTruthy();
    // test that coordinates were added correctly to the entities
    // some pps
    for (let pps of map.floors[0].ppses) {
      expect(pps).toHaveProperty("coordinate");
    }
    var pps1 = _.find(
      map.floors[0].ppses,
      ({ coordinate }) => coordinate == "12,11"
    );
    expect(pps1).toBeTruthy();
    expect(pps1.pps_id).toBe(1);
    expect(pps1.location).toBe("011.012");
    var pps6 = _.find(
      map.floors[1].ppses,
      ({ coordinate }) => coordinate == "42,44"
    );
    expect(pps6).toBeTruthy();
    expect(pps6.pps_id).toBe(6);
    expect(pps6.location).toBe("044.042");
    // some chargers
    for (let charger of map.floors[0].chargers) {
      expect(charger).toHaveProperty("coordinate");
    }
    var charger1 = _.find(
      map.floors[0].chargers,
      ({ coordinate }) => coordinate == "12,18"
    );
    expect(charger1).toBeTruthy();
    expect(charger1.charger_id).toBe(1);
    expect(charger1.charger_location).toBe("018.012");
  });

  test("import 3-7 map with single element array style zone.json", () => {
    var map = importMap({
      ...threeSevenJsons,
      zoneJson: [threeSevenJsons.zoneJson]
    });
    var result = mapValidate(map);
    expect(mapValidate.errors).toBeNull();
    expect(result).toBe(true);
  });

  test("import 3-7 map with queue_data.json also present", () => {
    var map = importMap({
      ...threeSevenJsons,
      queueDataJson: [
        [["012.012", 3], ["012.013", 3], ["012.014", 4]],
        [["012.015", 4]]
      ]
    });
    var result = mapValidate(map);
    expect(mapValidate.errors).toBeNull();
    expect(result).toBe(true);
    expect(map.queueDatas).toMatchObject([
      {
        queue_data_id: 1,
        coordinates: ["12,12", "13,12", "14,12"],
        data: [["012.012", 3], ["012.013", 3], ["012.014", 4]]
      },
      {
        queue_data_id: 2,
        coordinates: ["15,12"],
        data: [["012.015", 4]]
      }
    ]);
  });

  test("import 3-7 map with ods_excluded.json also present", () => {
    var map = importMap({
      ...threeSevenJsons,
      odsExcludedJson: {
        "ods_excluded_list":[
          {"excluded":true,"ods_tuple":"010.010--0"},
          {"excluded":true,"ods_tuple":"010.010--1"},
          {"excluded":true,"ods_tuple":"010.011--1"}
        ]}
    });
    var result = mapValidate(map);
    expect(mapValidate.errors).toBeNull();
    expect(result).toBe(true);
    expect(map.floors[0].odsExcludeds).toMatchObject([
      {"ods_excluded_id": 1, "coordinate": "10,10", "excluded":true,"ods_tuple":"010.010--0"},
      {"ods_excluded_id": 2, "coordinate": "10,10", "excluded":true,"ods_tuple":"010.010--1"},
      {"ods_excluded_id": 3, "coordinate": "11,10", "excluded":true,"ods_tuple":"010.011--1"}
    ]);
  });
});

describe("import bad maps", () => {
  test("import without map.json", () => {
    expect(() => importMap({})).toThrowError(/^map\.json is required$/);
  });

  test("import with malformed map json", () => {
    expect(() => importMap({ mapJson: "bad" })).toThrowError(
      /map_json parse error/
    );
  });

  test("map with duplicate barcodes on different floors", () => {
    var badMap = {
      ...threeSevenJsons,
      mapJson: [
        {
          floor_id: 1,
          map_values: [
            {
              blocked: false,
              zone: "defzone",
              coordinate: "[15, 12]",
              store_status: 0,
              barcode: "012.015",
              neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
              size_info: [750, 750, 750, 750],
              botid: "null"
            }
          ]
        },
        {
          floor_id: 2,
          map_values: [
            {
              blocked: false,
              zone: "defzone",
              coordinate: "[15,12]",
              store_status: 0,
              barcode: "017.018",
              neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
              size_info: [750, 750, 750, 750],
              botid: "null"
            }
          ]
        }
      ]
    };
    expect(() => importMap(badMap)).toThrowError(
      /Duplicate barcodes having same coordinate found in map\.json/
    );
  });
});

describe("getOdsExcludedBarcode", () => {
  test("good ods tuple", () => {
    expect(getOdsExcludedBarcode({ods_tuple: "000.000--0", excluded: true})).toBe("000.000");
    expect(getOdsExcludedBarcode({ods_tuple: "001.002--1", excluded: true})).toBe("001.002");
  });
});