require("dotenv").config({ path: ".env.test" });
import barcodeWithNumberCoordinate from "common/json-schemas/barcodeWithNumberCoordinate.json";
import definitionsSchema from "common/json-schemas/definitions.json";

var Ajv = require("ajv");
var ajv = new Ajv({
  schemas: [barcodeWithNumberCoordinate, definitionsSchema]
}); // options can be passed, e.g. {allErrors: true}
var validate = ajv.getSchema("barcodeWithNumberCoordinate");

describe("valid barcodeWithNumberCoordinate", () => {
  test("valid coordiante string like 15,12", () => {
    var barcode = {
      blocked: false,
      zone: "defzone",
      sector: 0,
      coordinate: "15,12",
      store_status: 0,
      barcode: "012.015",
      neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
      size_info: [750, 750, 750, 750],
      botid: "null"
    };
    expect(validate(barcode)).toBe(true);
  });
});

describe("invalid barcodeWithNumberCoordinate", () => {
  test("coordinate string is tuple of numbers (old style)", () => {
    var barcode = {
      blocked: false,
      zone: "defzone",
      sector: 0,
      coordinate: [15, 12],
      store_status: 0,
      barcode: "012.015",
      neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
      size_info: [750, 750, 750, 750],
      botid: "null"
    };
    var result = validate(barcode);
    expect(result).toBe(false);
    expect(validate.errors).toHaveLength(1);
    expect(validate.errors[0].message).toMatch(/should be string/);
  });

  test("coordinate not present", () => {
    var barcode = {
      blocked: false,
      zone: "defzone",
      sector: 0,
      store_status: 0,
      barcode: "012.015",
      neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
      size_info: [750, 750, 750, 750],
      botid: "null"
    };
    var result = validate(barcode);
    expect(result).toBe(false);
    expect(validate.errors).toHaveLength(1);
    expect(validate.errors[0].message).toMatch(/should have required property/);
  });

  test("coordinate is tuple of numbers string like [15, 12]", () => {
    var barcode = {
      blocked: false,
      zone: "defzone",
      sector: 0,
      coordinate: "[15, 12]",
      store_status: 0,
      barcode: "012.015",
      neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
      size_info: [750, 750, 750, 750],
      botid: "null"
    };
    var result = validate(barcode);
    expect(result).toBe(false);
    expect(validate.errors).toHaveLength(1);
    expect(validate.errors[0].message).toMatch(/should match pattern/);
  });
});
