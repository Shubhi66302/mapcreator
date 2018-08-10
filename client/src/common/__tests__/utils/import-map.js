require("dotenv").config({ path: ".env.test" });
import getLoadedAjv from "common/utils/get-loaded-ajv";
import importMap from "common/utils/import-map";
import continentalJsons from "test-data/test-jsons/maps/continental/all";
import threeSevenJsons from "test-data/test-jsons/maps/3-7/all";
import fs from "fs";

var ajv = getLoadedAjv();
var mapValidate = ajv.getSchema("map");

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
