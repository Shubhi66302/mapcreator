require("dotenv").config({ path: ".env.test" });
import barcodeWithStringCoordinate from "common/json-schemas/barcodeWithStringCoordinate.json";
import definitionsSchema from "common/json-schemas/definitions.json";

var Ajv = require("ajv");
var ajv = new Ajv({
  schemas: [barcodeWithStringCoordinate, definitionsSchema]
}); // options can be passed, e.g. {allErrors: true}
var validate = ajv.getSchema("barcodeWithStringCoordinate");

describe("valid barcodeWithStringCoordinate", () => {
  test("valid coordiante string without space", () => {
    var barcode = {
      blocked: false,
      zone: "defzone",
      coordinate: "[15, 12]",
      store_status: 0,
      barcode: "012.015",
      neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
      size_info: [750, 750, 750, 750],
      botid: "null"
    };
    expect(validate(barcode)).toBe(true);
  });
  test("valid coordiante string with space in between", () => {
    var barcode = {
      blocked: false,
      zone: "defzone",
      coordinate: "[15, 12]",
      store_status: 0,
      barcode: "012.015",
      neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
      size_info: [750, 750, 750, 750],
      botid: "null"
    };
    expect(validate(barcode)).toBe(true);
  });
});

describe("invalid barcodeWithStringCoordinate", () => {
  test("coordinate not present", () => {
    var barcode = {
      blocked: false,
      zone: "defzone",
      store_status: 0,
      barcode: "012.015",
      neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
      size_info: [750, 750, 750, 750],
      botid: "null"
    };
    expect(validate(barcode)).toBe(false);
  });

  test("coordinate is tuple of numbers", () => {
    var barcode = {
      blocked: false,
      zone: "defzone",
      coordinate: [15, 12],
      store_status: 0,
      barcode: "012.015",
      neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
      size_info: [750, 750, 750, 750],
      botid: "null"
    };
    expect(validate(barcode)).toBe(false);
  });
});
