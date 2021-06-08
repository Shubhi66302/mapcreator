require("dotenv").config({ path: ".env.test" });
import definitions from "common/json-schemas/definitions.json";
var Ajv = require("ajv");
var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}

describe("coordinateString", () => {
  var schema = definitions.coordinateString;
  describe("valid coordinate string", () => {
    test("non space separated", () => {
      expect(ajv.validate(schema, "[32,32]")).toBe(true);
    });
    test("space separated", () => {
      expect(ajv.validate(schema, "[32, 32]")).toBe(true);
    });
  });
  describe("invalid coordinate string", () => {
    test("some invalid coordinate string", () => {
      expect(ajv.validate(schema, "[a,b]")).toBe(false);
    });
  });
});

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

describe("coordinateKey", () => {
  var schema = definitions.coordinateKey;
  describe("valid coordinateKey", () => {
    test("comma separated numbers without space", () => {
      var result = ajv.validate(schema, "32,33");
      expect(ajv.errors).toBeNull();
      expect(result).toBe(true);
    });
  });
  describe("invalid coordinateKey", () => {
    test("space separated", () => {
      var result = ajv.validate(schema, "32, 31");
      expect(result).toBe(false);
      expect(ajv.errors).toHaveLength(1);
      expect(ajv.errors[0].message).toMatch(/should match pattern/);
    });
    test("some invalid coordinate string", () => {
      var result = ajv.validate(schema, "a,b");
      expect(result).toBe(false);
      expect(ajv.errors).toHaveLength(1);
      expect(ajv.errors[0].message).toMatch(/should match pattern/);
    });
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

describe("barcodeWithoutCoordinate", () => {
  var ajv = new Ajv({
    schemas: [definitions],
  }); // options can be passed, e.g. {allErrors: true}
  var validate = ajv.getSchema("definitions#/barcodeWithoutCoordinate");
  describe("valid barcodes", () => {
    test("barcode without adjacency", () => {
      // TODO: probably should print error messages on failure through validate.errors
      var barcode = {
        blocked: false,
        zone: "defzone",
        sector: 0,
        store_status: 0,
        barcode: "012.015",
        neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
        size_info: [750, 750, 750, 750],
        botid: "null",
      };
      expect(validate(barcode)).toBe(true);
    });

    test("barcode with adjacency", () => {
      var barcode = {
        botid: "null",
        blocked: false,
        store_status: 0,
        zone: "defzone",
        sector: 0,
        adjacency: [[11, 15], [10, 16], [11, 17], [31, 31]],
        neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 0]],
        barcode: "016.011",
        size_info: [750, 750, 750, 885],
      };
      expect(validate(barcode)).toBe(true);
    });

    test("barcode with special", () => {
      var barcode = {
        botid: "null",
        blocked: false,
        store_status: 0,
        zone: "defzone",
        sector: 0,
        adjacency: [[11, 15], [10, 16], [11, 17], [31, 31]],
        neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 0]],
        barcode: "016.011",
        size_info: [750, 750, 750, 885],
        special: true,
      };
      expect(validate(barcode)).toBe(true);
    });

    test("no barcode coordiante", () => {
      var barcode = {
        blocked: false,
        zone: "defzone",
        sector: 0,
        barcode: "016.011",
        store_status: 0,
        neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
        size_info: [750, 750, 750, 750],
        botid: "null",
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
        sector: 0,
        store_status: 0,
        neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
        size_info: [750, 750, 750, 750],
        botid: "null",
      };
      expect(validate(barcode)).toBe(false);
    });
    test("wrong type for size info", () => {
      var barcode = {
        blocked: false,
        zone: "defzone",
        sector: 0,
        barcode: "016.011",
        store_status: 0,
        neighbours: [[1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
        size_info: [750, 750, 750, "a", "b"],
        botid: "null",
      };
      expect(validate(barcode)).toBe(false);
    });
  });
});
