require("dotenv").config({ path: ".env.test" });
import barcodeWithStringCoordinate from "common/json-schemas/barcodeWithStringCoordinate.json";
import charger from "common/json-schemas/charger.json";
import pps from "common/json-schemas/pps.json";
import odsExcluded from "common/json-schemas/odsExcluded.json";
import queueData from "common/json-schemas/queueData.json";
import zone from "common/json-schemas/zone.json";
import elevator from "common/json-schemas/elevator.json";
import dockPoint from "common/json-schemas/dockPoint.json";
import fireEmergencySchema from "common/json-schemas/fireEmergency.json";
import definitionsSchema from "common/json-schemas/definitions.json";
import jsonFileDefinitions from "common/json-schemas/json-file-definitions.json";

var Ajv = require("ajv");
var ajv = new Ajv({
  schemas: [
    barcodeWithStringCoordinate,
    charger,
    pps,
    odsExcluded,
    queueData,
    zone,
    elevator,
    dockPoint,
    fireEmergencySchema,
    definitionsSchema,
    jsonFileDefinitions
  ]
}); // options can be passed, e.g. {allErrors: true}

describe("map.json", () => {
  var validate = ajv.getSchema("map_json");
  describe("valid map.json", () => {
    test("3-7 map.json", () => {
      var map = require("test-data/test-jsons/maps/3-7/map.json");
      var result = validate(map);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
  });
});

describe("single floor map.json", () => {
  var validate = ajv.getSchema("single_floor_map_json");
  describe("valid single floor map.json", () => {
    test("continental", () => {
      var map = require("test-data/test-jsons/maps/continental/map.json");
      var result = validate(map);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
  });
});

describe("charger.json", () => {
  var validate = ajv.getSchema("charger_json");
  describe("valid charger.json", () => {
    test("3-7 charger.json", () => {
      var chargerJson = require("test-data/test-jsons/maps/3-7/charger.json");
      var result = validate(chargerJson);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
    test("continental", () => {
      var chargerJson = require("test-data/test-jsons/maps/continental/charger.json");
      var result = validate(chargerJson);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
  });
});

describe("elevator.json", () => {
  var validate = ajv.getSchema("elevator_json");
  describe("valid elevator.json", () => {
    test("3-7 elevator.json", () => {
      var elevatorJson = require("test-data/test-jsons/maps/3-7/elevator.json");
      var result = validate(elevatorJson);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
  });
});

describe("fire_emergency.json", () => {
  var validate = ajv.getSchema("fire_emergency_json");
  describe("valid fire_emergency.json", () => {
    test("3-7 fire_emergency.json", () => {
      var fireEmergencyJson = require("test-data/test-jsons/maps/3-7/fire_emergency.json");
      var result = validate(fireEmergencyJson);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
  });
});

describe("ods_excluded.json", () => {
  var validate = ajv.getSchema("ods_excluded_json");
  describe("valid ods_excluded.json", () => {
    test("3-7 ods_excluded.json", () => {
      var odsExcludedJson = require("test-data/test-jsons/maps/3-7/ods_excluded.json");
      var result = validate(odsExcludedJson);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
  });
});

describe("pps.json", () => {
  var validate = ajv.getSchema("pps_json");
  describe("valid pps.json", () => {
    test("3-7 pps.json", () => {
      var ppsJson = require("test-data/test-jsons/maps/3-7/pps.json");
      var result = validate(ppsJson);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
    test("continental", () => {
      var ppsJson = require("test-data/test-jsons/maps/continental/pps.json");
      var result = validate(ppsJson);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
  });
});

describe("zone.json", () => {
  var validate = ajv.getSchema("zone_json");
  describe("valid zone.json", () => {
    test("3-7 zone.json", () => {
      var zoneJson = require("test-data/test-jsons/maps/3-7/zone.json");
      var result = validate(zoneJson);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
    test("continental", () => {
      var zoneJson = require("test-data/test-jsons/maps/continental/zone.json");
      var result = validate(zoneJson);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
  });
});
