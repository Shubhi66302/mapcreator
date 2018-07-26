require("dotenv").config({ path: ".env.test" });
import odsSchema from "server/src/json-schemas/ods.json";
import definitionsSchema from "server/src/json-schemas/definitions.json";

var Ajv = require("ajv");
var ajv = new Ajv({ schemas: [odsSchema, definitionsSchema] }); // options can be passed, e.g. {allErrors: true}
var validate = ajv.getSchema("ods");

describe("valid ods", () => {
  test("some ods", () => {
    var odses = [
      { excluded: true, ods_tuple: "017.017--3" },
      { excluded: true, ods_tuple: "018.017--3" }
    ];
    odses.forEach(ods => {
      var result = validate(ods);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
  });
});
