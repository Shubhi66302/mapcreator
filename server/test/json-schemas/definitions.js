require("dotenv").config({ path: ".env.test" });
import definitions from "server/src/json-schemas/definitions.json";
var Ajv = require("ajv");
var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}

describe("coordinate", () => {
  var schema = definitions.coordinate;
  test("valid coordinate", () => {
    var validCoordinate = [1, 2];
    expect(ajv.validate(schema, validCoordinate)).toBe(true);
  });
  test("invalid coordinate", () => {
    var invalidCoordinate = ["a", "b"];
    expect(ajv.validate(schema, invalidCoordinate)).toBe(false);
  });
});

describe("barcodeString", () => {
  var schema = definitions.barcodeString;
  test("valid barcode string", () => {
    expect(ajv.validate(schema, "001.002")).toBe(true);
  });
  test("invalid barcode string", () => {
    for (const barcode of ["abc.def", "01.02", "helloworld", "111"]) {
      expect(ajv.validate(schema, barcode)).toBe(false);
    }
  });
});

describe("direction", () => {
  var schema = definitions.direction;
  test("valid direction", () => {
    expect(ajv.validate(schema, 0)).toBe(true);
    expect(ajv.validate(schema, 1)).toBe(true);
    expect(ajv.validate(schema, 2)).toBe(true);
    expect(ajv.validate(schema, 3)).toBe(true);
  });
  test("invalid direction", () => {
    expect(ajv.validate(schema, 4)).toBe(false);
    expect(ajv.validate(schema, "1")).toBe(false);
    expect(ajv.validate(schema, "a")).toBe(false);
  });
});
