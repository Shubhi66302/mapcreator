require("dotenv").config({ path: ".env.test" });
import odsSchema from "common/json-schemas/ods.json";
import definitionsSchema from "common/json-schemas/definitions.json";

var Ajv = require("ajv");
var ajv = new Ajv({ schemas: [odsSchema, definitionsSchema] }); // options can be passed, e.g. {allErrors: true}
var validate = ajv.getSchema("ods");

describe("valid ods", () => {
  test("some ods", () => {
    var odses = [
      { excluded: true, ods_tuple: "017.017--3" },
      { excluded: true, ods_tuple: "018.017--2" },
      { excluded: true, ods_tuple: "018.017--1" },
      { excluded: true, ods_tuple: "018.017--0" }
    ];
    odses.forEach(ods => {
      var result = validate(ods);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
  });
  test("invalid ods with misshapen ods_tuple", () => {
    var odses = [
      { excluded: true, ods_tuple: "017.017--4" },
      { excluded: true, ods_tuple: "018,017--3" },
      { excluded: true, ods_tuple: "018.017" }
    ];
    odses.forEach(ods => {
      var result = validate(ods);
      expect(validate.errors).toHaveLength(1);
      expect(validate.errors[0].message).toMatch(/should match pattern/);
      expect(result).toBe(false);
    });
  });
});
