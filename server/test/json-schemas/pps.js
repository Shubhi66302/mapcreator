require("dotenv").config({ path: ".env.test" });
import ppsSchema from "server/src/json-schemas/pps.json";
import dockPointSchema from "server/src/json-schemas/dock_point.json";
import definitionsSchema from "server/src/json-schemas/definitions.json";
import goodPPSes from "server/test/json-schemas/test-jsons/good-ppses.json";

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
