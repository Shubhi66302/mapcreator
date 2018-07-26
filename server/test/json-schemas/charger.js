require("dotenv").config({ path: ".env.test" });
import chargerSchema from "server/src/json-schemas/charger.json";
import definitionsSchema from "server/src/json-schemas/definitions.json";

var Ajv = require("ajv");
var ajv = new Ajv({ schemas: [chargerSchema, definitionsSchema] }); // options can be passed, e.g. {allErrors: true}
var validate = ajv.getSchema("charger");

describe("valid chargers", () => {
  test("normal charger", () => {
    var charger = {
      charger_location: "041.043",
      entry_point_location: "060.060",
      charger_direction: 0,
      entry_point_direction: 0,
      reinit_point_direction: 0,
      mode: "manual",
      charger_type: "rectangular_plate_charger",
      reinit_point_location: "060.060",
      charger_id: 3,
      status: "disconnected"
    };
    var result = validate(charger);
    expect(validate.errors).toBeNull();
    expect(result).toBe(true);
  });
});

describe("invalid chargers", () => {
  test("missing charger_type", () => {
    var charger = {
      charger_direction: 3,
      entry_point_direction: 3,
      charger_id: 1,
      mode: "manual",
      reinit_point_direction: 3,
      entry_point_location: "030.030",
      status: "disconnected",
      charger_location: "018.012",
      reinit_point_location: "030.030"
    };
    var result = validate(charger);
    expect(result).toBe(false);
    expect(validate.errors).toHaveLength(1);
    expect(validate.errors[0].message).toBe(
      "should have required property 'charger_type'"
    );
  });
});
