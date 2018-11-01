require("dotenv").config({ path: ".env.test" });
import queueDataSchema from "common/json-schemas/queueData.json";
import definitionsSchema from "common/json-schemas/definitions.json";

var Ajv = require("ajv");
var ajv = new Ajv({ schemas: [queueDataSchema, definitionsSchema] }); // options can be passed, e.g. {allErrors: true}
var validate = ajv.getSchema("queueData");

describe("valid queue_data", () => {
  test("normal queue data", () => {
    var queueData = [
      ["012.017", 0],
      ["011.017", 1],
      ["011.016", 1],
      ["011.015", 1],
      ["011.014", 4]
    ];
    var result = validate(queueData);
    expect(validate.errors).toBeNull();
    expect(result).toBe(true);
  });
});

describe("invalid queue_data", () => {
  test("empty queue", () => {
    var result = validate([]);
    expect(validate.errors).toHaveLength(1);
    expect(validate.errors[0].message).toBe(
      `should NOT have fewer than 1 items`
    );
    expect(result).toBe(false);
  });
  test("invalid direction", () => {
    var queueData = [["012.017", 5]];
    var result = validate(queueData);
    expect(validate.errors).toHaveLength(1);
    expect(validate.errors[0].message).toBe(
      "should be equal to one of the allowed values"
    );
    expect(result).toBe(false);
  });
});
