require("dotenv").config({ path: ".env.test" });
import zoneSchema from "common/json-schemas/zone.json";
import definitionsSchema from "common/json-schemas/definitions.json";

var Ajv = require("ajv");
var ajv = new Ajv({ schemas: [zoneSchema, definitionsSchema] }); // options can be passed, e.g. {allErrors: true}
var validate = ajv.getSchema("zone");

describe("valid zone", () => {
  test("normal zone", () => {
    var zone = { zone_id: "somezone", blocked: false, paused: false };
    var result = validate(zone);
    expect(validate.errors).toBeNull();
    expect(result).toBe(true);
  });
});

describe("invalid zone", () => {
  test("zone id is number", () => {
    var zone = { zone_id: 1, blocked: false, paused: false };
    var result = validate(zone);
    expect(validate.errors).toHaveLength(1);
    expect(validate.errors[0].message).toBe("should be string");
    expect(result).toBe(false);
  });
  test("zone id missing", () => {
    var zone = { blocked: false, paused: false };
    var result = validate(zone);
    expect(validate.errors).toHaveLength(1);
    expect(validate.errors[0].message).toBe(
      "should have required property 'zone_id'"
    );
    expect(result).toBe(false);
  });
});
