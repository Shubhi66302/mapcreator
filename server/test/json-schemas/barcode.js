require("dotenv").config({ path: ".env.test" });
import barcodeSchema from "server/src/json-schemas/barcode.json";
import definitionsSchema from "server/src/json-schemas/definitions.json";

var Ajv = require("ajv");
var ajv = new Ajv({ schemas: [barcodeSchema, definitionsSchema] }); // options can be passed, e.g. {allErrors: true}
var validate = ajv.getSchema("barcode");

describe("valid barcodes", () => {
  test("barcode without adjacency", () => {
    // TODO: probably should print error messages on failure through validate.errors
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

  test("barcode with adjacency", () => {
    var barcode = {
      botid: "null",
      blocked: false,
      store_status: 0,
      coordinate: [16, 11],
      zone: "defzone",
      adjacency: [[11, 15], [10, 16], [11, 17], [31, 31]],
      neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 0]],
      barcode: "016.011",
      size_info: [750, 750, 750, 885]
    };
    expect(validate(barcode)).toBe(true);
  });

  test("barcode with special", () => {
    var barcode = {
      botid: "null",
      blocked: false,
      store_status: 0,
      coordinate: [11, 16],
      zone: "defzone",
      adjacency: [[11, 15], [10, 16], [11, 17], [31, 31]],
      neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 0]],
      barcode: "016.011",
      size_info: [750, 750, 750, 885],
      special: true
    };
    expect(validate(barcode)).toBe(true);
  });
});

describe("invalid barcodes", () => {
  // maybe test for no neighbours also
  test("no barcode string", () => {
    var barcode = {
      blocked: false,
      zone: "defzone",
      coordinate: [15, 12],
      store_status: 0,
      neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
      size_info: [750, 750, 750, 750],
      botid: "null"
    };
    expect(validate(barcode)).toBe(false);
  });
  test("no barcode coordiante", () => {
    var barcode = {
      blocked: false,
      zone: "defzone",
      barcode: "016.011",
      store_status: 0,
      neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
      size_info: [750, 750, 750, 750],
      botid: "null"
    };
    expect(validate(barcode)).toBe(false);
  });
  test("wrong type for size info", () => {
    var barcode = {
      blocked: false,
      zone: "defzone",
      barcode: "016.011",
      store_status: 0,
      neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
      size_info: [750, 750, 750, "a", "b"],
      botid: "null"
    };
    expect(validate(barcode)).toBe(false);
  });
});
