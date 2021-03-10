require("dotenv").config({ path: ".env.test" });
import { normalizeMap } from "utils/normalizr";
//import getLoadedAjv from "./get-loaded-ajv";
import importMap from "./import-map";
import exportMap from "./export-map";
//import continentalJsons from "test-data/test-jsons/maps/continental/all";
import threeSevenJsons from "test-data/test-jsons/maps/3-7/all";
import vanilla3x3Map from "test-data/test-maps/3x3-vanilla.json";

// var convertFileNames = map => ({
//   mapJson: map.map,
//   elevatorJson: map.elevator,
//   zoneJson: map.zone,
//   sectorJson: map.sector,
//   queueDataJson: map.queue_data,
//   chargerJson: map.charger,
//   ppsJson: map.pps,
//   fireEmergencyJson: map.fire_emergency,
//   odsExcludedJson: map.ods_excluded,
//   dockPointJson: map.dock_point
// });

describe("export good maps", () => {
  // test("3-7", () => {
  //   var ajv = getLoadedAjv();
  //   // import first, then export, then import again?
  //   expect(threeSevenJsons.mapJson).toBeTruthy();
  //   var map = importMap(threeSevenJsons);
  //   var normalizedMap = normalizeMap({ id: 1, map });
  //   var exported = exportMap(normalizedMap);

  //   // individually check each file to not be empty
  //   expect(exported.map).toBeTruthy();
  //   expect(exported.charger).toHaveLength(3);
  //   expect(exported.elevator).toHaveLength(2);
  //   expect(exported.fire_emergency).toHaveLength(6);
  //   expect(exported.ods_excluded).toMatchObject({ ods_excluded_list: [] });
  //   expect(exported.pps).toHaveLength(6);
  //   // coordinate was a mapcreator internal field, shouldn't be present in exported files
  //   for (let ppsInstance of exported.pps) {
  //     expect(ppsInstance).toHaveProperty("pps_id");
  //     expect(ppsInstance).not.toHaveProperty("coordinate");
  //   }
  //   for (let chargerInstance of exported.charger) {
  //     expect(chargerInstance).toHaveProperty("charger_id");
  //     expect(chargerInstance).not.toHaveProperty("coordinate");
  //   }
  //   for (let fireEmergencyInstance of exported.fire_emergency) {
  //     expect(fireEmergencyInstance).not.toHaveProperty("coordinate");
  //   }
  //   expect(exported.zone).toMatchObject({
  //     header: {
  //       "content-type": "application/json",
  //       accept: "application/json"
  //     },
  //     type: "POST",
  //     data: [
  //       { zonerec: { paused: false, blocked: false, zone_id: "safe" } },
  //       { zonerec: { paused: false, blocked: false, zone_id: "unsafe" } }
  //     ],
  //     url: "/api/zonerec"
  //   });
  //   expect(exported.sector).toMatchObject({
  //     header: {
  //       "content-type": "application/json",
  //       accept: "application/json"
  //     },
  //     type: "POST",
  //     data: [],
  //     url: "/api/sectorrec"
  //   });
  //   expect(exported.queue_data).toHaveLength(0);
  //   expect(exported.sectorBarcodeMapping).toHaveLength(1);
  //   expect(exported.dock_point).toHaveLength(0);

  //   // import it again to verify
  //   var importedAgain = importMap(convertFileNames(exported));
  //   var mapValidate = ajv.getSchema("map");
  //   var result = mapValidate(importedAgain);
  //   expect(mapValidate.errors).toBeNull();
  //   expect(result).toBe(true);
  // });

  test("queue_data.json should be exported correctly for 3-7 map", () => {
    expect(threeSevenJsons.mapJson).toBeTruthy();
    var map = {
      ...importMap(threeSevenJsons),
      queueDatas: [
        {
          queue_data_id: 1,
          coordinates: ["12,12", "13,12", "14,12"],
          data: [["012.012", 0], ["012.013", 0], ["012.014", 4]]
        }
      ]
    };
    var normalizedMap = normalizeMap({ id: 1, map });
    var exported = exportMap(normalizedMap);
    expect(exported.queue_data).toBeTruthy();
    expect(exported.queue_data).toMatchObject([
      [["012.012", 0], ["012.013", 0], ["012.014", 4]]
    ]);
  });

  // test("continental", () => {
  //   var ajv = getLoadedAjv();
  //   // import first, then export, then import again?
  //   var map = importMap(continentalJsons);
  //   var normalizedMap = normalizeMap({ id: 1, map });
  //   var exported = exportMap(normalizedMap);

  //   // individually check each file to be correct
  //   expect(exported.map).toBeTruthy();
  //   expect(exported.charger).toHaveLength(24);
  //   expect(exported.pps).toHaveLength(36);
  //   expect(exported.zone.data).toHaveLength(17);
  //   expect(exported.sector.data).toHaveLength(0);
  //   expect(exported.elevator).toHaveLength(0);
  //   expect(exported.fire_emergency).toHaveLength(0);
  //   expect(exported.queue_data).toHaveLength(0);
  //   expect(exported.sectorBarcodeMapping).toHaveLength(1);
  //   expect(exported.dock_point).toHaveLength(0);
  //   expect(exported.ods_excluded).toMatchObject({ ods_excluded_list: [] });
  //   for (let ppsInstance of exported.pps) {
  //     expect(ppsInstance).toHaveProperty("pps_id");
  //   }
  //   for (let chargerInstance of exported.charger) {
  //     expect(chargerInstance).toHaveProperty("charger_id");
  //   }
  //   // import again to verify
  //   var importedAgain = importMap(convertFileNames(exported));
  //   var mapValidate = ajv.getSchema("map");
  //   var result = mapValidate(importedAgain);
  //   expect(mapValidate.errors).toBeNull();
  //   expect(result).toBe(true);
  // });
});

describe("export single floor maps", () => {
  test("vanilla 3x3", () => {
    var map = normalizeMap(vanilla3x3Map);
    var exported = exportMap(map, true);
    expect(exported.map).toBeTruthy();
    expect(exported.map).toHaveLength(9);
  });
});
