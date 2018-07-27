require("dotenv").config({ path: ".env.test" });
import barcodeWithStringCoordinate from "server/src/json-schemas/barcodeWithStringCoordinate.json";
import charger from "server/src/json-schemas/charger.json";
import pps from "server/src/json-schemas/pps.json";
import ods from "server/src/json-schemas/ods.json";
import queueData from "server/src/json-schemas/queueData.json";
import zone from "server/src/json-schemas/zone.json";
import elevator from "server/src/json-schemas/elevator.json";
import dockPoint from "server/src/json-schemas/dockPoint.json";
import fireEmergencySchema from "server/src/json-schemas/fireEmergency.json";
import definitionsSchema from "server/src/json-schemas/definitions.json";
import jsonFileDefinitions from "server/src/json-schemas/json-file-definitions.json";

var Ajv = require("ajv");
var ajv = new Ajv({
  schemas: [
    barcodeWithStringCoordinate,
    charger,
    pps,
    ods,
    queueData,
    zone,
    elevator,
    dockPoint,
    fireEmergencySchema,
    definitionsSchema,
    jsonFileDefinitions
  ]
}); // options can be passed, e.g. {allErrors: true}
// var validate = ajv.getSchema("fireEmergency");

describe("map.json", () => {
  var validate = ajv.getSchema("map_json");
  describe("valid map.json", () => {
    test("3-7 map.json", () => {
      var map = require("server/test/json-schemas/test-jsons/maps/3-7/map.json");
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
      var map = require("server/test/json-schemas/test-jsons/maps/continental/map.json");
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
      var chargerJson = require("server/test/json-schemas/test-jsons/maps/3-7/charger.json");
      var result = validate(chargerJson);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
    test("continental", () => {
      var chargerJson = require("server/test/json-schemas/test-jsons/maps/continental/charger.json");
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
      var elevatorJson = require("server/test/json-schemas/test-jsons/maps/3-7/elevator.json");
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
      var fireEmergencyJson = require("server/test/json-schemas/test-jsons/maps/3-7/fire_emergency.json");
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
      var odsExcludedJson = require("server/test/json-schemas/test-jsons/maps/3-7/ods_excluded.json");
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
      var ppsJson = require("server/test/json-schemas/test-jsons/maps/3-7/pps.json");
      var result = validate(ppsJson);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
    test("continental", () => {
      var ppsJson = require("server/test/json-schemas/test-jsons/maps/continental/pps.json");
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
      var zoneJson = require("server/test/json-schemas/test-jsons/maps/3-7/zone.json");
      var result = validate(zoneJson);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
    test("continental", () => {
      var zoneJson = require("server/test/json-schemas/test-jsons/maps/continental/zone.json");
      var result = validate(zoneJson);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
  });
});
