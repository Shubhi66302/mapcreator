require("dotenv").config({ path: ".env.test" });
import odsExcludedSchema from "common/json-schemas/odsExcluded.json";
import definitionsSchema from "common/json-schemas/definitions.json";

var Ajv = require("ajv");
var ajv = new Ajv({ schemas: [odsExcludedSchema, definitionsSchema] }); // options can be passed, e.g. {allErrors: true}
var validate = ajv.getSchema("odsExcluded");

describe("valid ods excluded", () => {
  test("some ods excludeds", () => {
    var odsExcludeds = [
      { excluded: true, ods_tuple: "017.017--3" },
      { excluded: true, ods_tuple: "018.017--2" },
      { excluded: true, ods_tuple: "018.017--1" },
      { excluded: true, ods_tuple: "018.017--0" }
    ];
    odsExcludeds.forEach(odsExcluded => {
      var result = validate(odsExcluded);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
  });
  test("invalid ods with misshapen ods_tuple", () => {
    var odsExcludeds = [
      { excluded: true, ods_tuple: "017.017--4" },
      { excluded: true, ods_tuple: "018,017--3" },
      { excluded: true, ods_tuple: "018.017" }
    ];
    odsExcludeds.forEach(odsExcluded => {
      var result = validate(odsExcluded);
      expect(validate.errors).toHaveLength(1);
      expect(validate.errors[0].message).toMatch(/should match pattern/);
      expect(result).toBe(false);
    });
  });
});
