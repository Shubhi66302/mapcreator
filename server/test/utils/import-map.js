require("dotenv").config({ path: ".env.test" });
import getLoadedAjv from "server/src/utils/get-loaded-ajv";
import importMap from "server/src/utils/import-map";
import continentalJsons from "server/test/json-schemas/test-jsons/maps/continental/all";
import threeSevenJsons from "server/test/json-schemas/test-jsons/maps/3-7/all";
import fs from "fs";

describe("import good maps", () => {
  test("import continental map", () => {
    var ajv = getLoadedAjv();
    var map = importMap(continentalJsons);
    var mapValidate = ajv.getSchema("map");
    var result = mapValidate(map);
    expect(mapValidate.errors).toBeNull();
    expect(result).toBe(true);
    // debug: log the map to a file. nevermind.
    // fs.writeFileSync("/tmp/map.json", JSON.stringify(map), "utf-8");
  });

  test("import 3-7 map", () => {
    var ajv = getLoadedAjv();
    var map = importMap(threeSevenJsons);
    var mapValidate = ajv.getSchema("map");
    var result = mapValidate(map);
    expect(mapValidate.errors).toBeNull();
    expect(result).toBe(true);
  });
});
