require("dotenv").config({ path: ".env.test" });
import barcodeWithNumberCoordinate from "server/src/json-schemas/barcodeWithNumberCoordinate.json";
import definitionsSchema from "server/src/json-schemas/definitions.json";

var Ajv = require("ajv");
var ajv = new Ajv({
  schemas: [barcodeWithNumberCoordinate, definitionsSchema]
}); // options can be passed, e.g. {allErrors: true}
var validate = ajv.getSchema("barcodeWithNumberCoordinate");

describe("valid barcodeWithNumberCoordinate", () => {
  test("valid coordiante string", () => {
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
    expect(validate(barcode)).toBe(true);
  });
});

describe("invalid barcodeWithNumberCoordinate", () => {
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
      coordinate: "[15, 12]",
      store_status: 0,
      barcode: "012.015",
      neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
      size_info: [750, 750, 750, 750],
      botid: "null"
    };
    expect(validate(barcode)).toBe(false);
  });
});
