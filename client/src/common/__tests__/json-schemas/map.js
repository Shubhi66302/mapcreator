// TODO: write more tests for schema
require("dotenv").config({ path: ".env.test" });
import mapSchema from "common/json-schemas/map.json";
import getLoadedAjv from "common/utils/get-loaded-ajv";

var ajv = getLoadedAjv();
// individually testing some fields of map object, eg. queueDatas
describe("queueDatas", () => {
  ajv.addSchema(mapSchema.properties.queueDatas, "queueDatasSchema");
  var validate = ajv.getSchema("queueDatasSchema");
  test("should not throw error on a correct queueDatas object", () => {
    var queueDatas = [
      {
        queue_data_id: 1,
        coordinates: ["11,11", "12,12"],
        data: [["011.011", 0], ["012.012", 1]]
      }
    ];
    var result = validate(queueDatas);
    expect(validate.errors).toBeNull();
    expect(result).toBe(true);
  });
  test("should throw error on a queueDatas object without coordinates key", () => {
    var queueDatas = [
      {
        queue_data_id: 2,
        data: [["011.012", 0], ["012.012", 2]]
      }
    ];
    var result = validate(queueDatas);
    expect(validate.errors).toHaveLength(1);
    expect(validate.errors[0].message).toMatch(
      /should have required property 'coordinates'/
    );
    expect(result).toBe(false);
  });
  test("should not throw error on an array of size 0 (ie no queue data)", () => {
    var result = validate([]);
    expect(validate.errors).toBeNull();
    expect(result).toBe(true);
  });
  test("should throw error when no data field is present", () => {
    var queueDatas = [
      {
        queue_data_id: 2,
        coordinates: ["11,11", "12,11"]
      }
    ];
    var result = validate(queueDatas);
    expect(validate.errors).toHaveLength(1);
    expect(validate.errors[0].message).toMatch(
      /should have required property 'data'/
    );
    expect(result).toBe(false);
  });
  // Error is not thrown when coordinates field doesn't match data field since this can't be detected by schema
  // should probably find some other way of checking that.
});
