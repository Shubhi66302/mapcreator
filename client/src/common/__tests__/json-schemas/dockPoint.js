require("dotenv").config({ path: ".env.test" });
import dockPointSchema from "common/json-schemas/dockPoint.json";
import definitionsSchema from "common/json-schemas/definitions.json";

var Ajv = require("ajv");
var ajv = new Ajv({ schemas: [dockPointSchema, definitionsSchema] }); // options can be passed, e.g. {allErrors: true}
var validate = ajv.getSchema("dockPoint");

describe("valid dock point", () => {
  test("some dock points", () => {
    var dockPoints = [
      {
        pps_list: [1, 2],
        exit_position: "016.018",
        dock_sequence_number: 1,
        pptl_frame_type: "11",
        position: "015.018",
        wait_position: "014.018",
        direction: 1
      },
      {
        pps_list: [1, 2],
        exit_position: "016.018",
        dock_sequence_number: 1,
        pptl_frame_type: "11",
        position: "015.017",
        wait_position: "014.018",
        direction: 1
      }
    ];
    dockPoints.forEach(dockPoint => {
      var result = validate(dockPoint);
      expect(validate.errors).toBeNull();
      expect(result).toBe(true);
    });
  });
});

describe("invalid dock point", () => {
  test("missing position", () => {
    var dockPoint = {
      pps_list: [1, 2],
      exit_position: "016.018",
      dock_sequence_number: 1,
      pptl_frame_type: "11",
      wait_position: "014.018",
      direction: 1
    };
    var result = validate(dockPoint);
    expect(result).toBe(false);
    expect(validate.errors).toHaveLength(1);
    expect(validate.errors[0].message).toBe(
      "should have required property 'position'"
    );
  });
});
