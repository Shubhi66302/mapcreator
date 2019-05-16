require("dotenv").config({ path: ".env.test" });
import ppsSchema from "common/json-schemas/pps.json";
import dockPointSchema from "common/json-schemas/dockPoint.json";
import definitionsSchema from "common/json-schemas/definitions.json";
import goodPPSes from "test-data/test-jsons/good-ppses.json";

var Ajv = require("ajv");
var ajv = new Ajv({ schemas: [ppsSchema, definitionsSchema, dockPointSchema] }); // options can be passed, e.g. {allErrors: true}
var validate = ajv.getSchema("pps");

describe("valid pps", () => {
  test("some ppses", () => {
    goodPPSes.forEach(pps => {
      var result = validate(pps);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
  });
});

describe("invalid pps", () => {
  test("wrong allowed_modes", () => {
    var pps = {
      queue_barcodes: [],
      allowed_modes: ["wrongthing", "pick", "audit"],
      status: "disconnected",
      pick_position: "015.015",
      pick_direction: 0,
      pps_url: "http://localhost:8181/pps/5/api/",
      location: "015.015",
      "type": "manual"
    };
    var result = validate(pps);
    expect(result).toBe(false);
    expect(validate.errors).toHaveLength(1);
    expect(validate.errors[0].message).toBe(
      "should be equal to one of the allowed values"
    );
  });
  test("pps type missing", () => {
    var pps = {
      queue_barcodes: [],
      allowed_modes: ["audit"],
      status: "disconnected",
      pick_position: "015.015",
      pick_direction: 0,
      pps_url: "http://localhost:8181/pps/5/api/",
      location: "015.015"
    };
    var result = validate(pps);
    expect(result).toBe(false);
    expect(validate.errors).toHaveLength(1);
    expect(validate.errors[0].message).toBe(
      "should have required property 'type'"
    );
  });
});
