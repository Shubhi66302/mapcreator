require("dotenv").config({ path: ".env.test" });
import fireEmergencySchema from "server/src/json-schemas/fireEmergency.json";
import definitionsSchema from "server/src/json-schemas/definitions.json";

var Ajv = require("ajv");
var ajv = new Ajv({ schemas: [fireEmergencySchema, definitionsSchema] }); // options can be passed, e.g. {allErrors: true}
var validate = ajv.getSchema("fireEmergency");

describe("valid fire emergency", () => {
  test("some fire emergencies", () => {
    var fireEmergencies = [
      {
        priority: "1",
        type: "escape_path",
        group_id: "1",
        barcode: "017.018"
      },
      {
        priority: "1",
        type: "escape_path",
        group_id: "1",
        barcode: "017.017"
      },
      {
        priority: "1",
        type: "escape_path",
        group_id: "1",
        barcode: "018.018"
      },
      {
        priority: "1",
        type: "escape_path",
        group_id: "1",
        barcode: "018.017"
      },
      { priority: "0", type: "shutter", group_id: "2", barcode: "017.015" },
      { priority: "0", type: "shutter", group_id: "2", barcode: "018.015" }
    ];
    fireEmergencies.forEach(fireEmergency => {
      var result = validate(fireEmergency);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
  });
});

describe("invalid fire emergency", () => {
  test("incorrect priority", () => {
    var fireEmergency = {
      priority: "5",
      type: "shutter",
      group_id: "2",
      barcode: "017.015"
    };
    var result = validate(fireEmergency);
    expect(result).toBe(false);
    expect(validate.errors).toHaveLength(1);
    expect(validate.errors[0].message).toBe(
      "should be equal to one of the allowed values"
    );
  });
  test("incorrect type", () => {
    var fireEmergency = {
      priority: "0",
      type: "sometype",
      group_id: "2",
      barcode: "017.015"
    };
    var result = validate(fireEmergency);
    expect(result).toBe(false);
    expect(validate.errors).toHaveLength(1);
    expect(validate.errors[0].message).toBe(
      "should be equal to one of the allowed values"
    );
  });
  test("missing barcode", () => {
    var fireEmergency = {
      priority: "0",
      type: "shutter",
      group_id: "2"
    };
    var result = validate(fireEmergency);
    expect(result).toBe(false);
    expect(validate.errors).toHaveLength(1);
    expect(validate.errors[0].message).toBe(
      "should have required property 'barcode'"
    );
  });
});
