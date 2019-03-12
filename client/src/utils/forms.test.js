import {
  listOfBarcodesSchema,
  yupPosIntSchema,
  yupNonNegIntSchema,
  yupBarcodeStringSchema,
  yupEntryExitBarcodesSchema,
  yupCoordinateStringSchema,
  yupDirectionSchema,
  yupCoordinateListSchema
} from "./forms";

describe("listOfBarcodesSchema", () => {
  var regex = new RegExp(listOfBarcodesSchema.pattern);
  test("good cases", () => {
    expect(regex.test("003.003")).toBe(true);
    expect(regex.test("003.003, 002.002")).toBe(true);
    expect(regex.test("003.003, 004.004, 005.006")).toBe(true);
    expect(regex.test("003.003,004.004,002.002  ")).toBe(true);
  });
  test("bad cases", () => {
    expect(regex.test("")).toBe(false);
    expect(regex.test("abc.def")).toBe(false);
    expect(regex.test("001.001,")).toBe(false);
    expect(regex.test("001.001,,,")).toBe(false);
  });
});

describe("yupPosIntSchema", () => {
  test("good cases", () => {
    expect(yupPosIntSchema.isValidSync(5)).toBe(true);
    // casting is done automatically
    expect(yupPosIntSchema.isValidSync("1")).toBe(true);
  });
  test("bad cases", () => {
    expect(yupPosIntSchema.isValidSync(-1)).toBe(false);
    expect(yupPosIntSchema.isValidSync(0)).toBe(false);
    expect(yupPosIntSchema.isValidSync("abc")).toBe(false);
    expect(yupPosIntSchema.isValidSync(1.1)).toBe(false);
  });
});

describe("yupNonNegIntSchema", () => {
  test("good cases", () => {
    expect(yupNonNegIntSchema.isValidSync(5)).toBe(true);
    // casting is done automatically
    expect(yupNonNegIntSchema.isValidSync("1")).toBe(true);
    expect(yupNonNegIntSchema.isValidSync(0)).toBe(true);
    expect(yupNonNegIntSchema.isValidSync("0")).toBe(true);
  });
  test("bad cases", () => {
    expect(yupNonNegIntSchema.isValidSync(-1)).toBe(false);
    expect(yupNonNegIntSchema.isValidSync("abc")).toBe(false);
    expect(yupNonNegIntSchema.isValidSync(1.1)).toBe(false);
  });
});

describe("yupBarcodeStringSchema", () => {
  test("good cases", () => {
    expect(yupBarcodeStringSchema.isValidSync("002.003")).toBe(true);
  });
  test("bad cases", () => {
    expect(yupBarcodeStringSchema.isValidSync("00d.003")).toBe(false);
    expect(yupBarcodeStringSchema.isValidSync("000.003.004")).toBe(false);
  });
});

describe("yupEntryExitBarcodesSchema", () => {
  test("good cases", () => {
    expect(
      yupEntryExitBarcodesSchema.isValidSync([
        {
          barcode: "000.000",
          boom_barrier_id: 4,
          floor_id: 1
        }
      ])
    ).toBe(true);
  });
  test("empty list", () => {
    expect(yupEntryExitBarcodesSchema.isValidSync([])).toBe(true);
  });
  test("missing fields", () => {
    expect(
      yupEntryExitBarcodesSchema.isValidSync([
        {
          barcode: "000.000",
          boom_barrier_id: 4
        }
      ])
    ).toBe(false);
    expect(
      yupEntryExitBarcodesSchema.isValidSync([
        {
          barcode: "000.000",
          floor_id: 3
        }
      ])
    ).toBe(false);
    expect(
      yupEntryExitBarcodesSchema.isValidSync([
        {
          floor_id: 3,
          boom_barrier_id: 4
        }
      ])
    ).toBe(false);
  });
  test("malformed fields", () => {
    expect(
      yupEntryExitBarcodesSchema.isValidSync([
        {
          barcode: "00",
          boom_barrier_id: 4,
          floor_id: 1
        }
      ])
    ).toBe(false);
    expect(
      yupEntryExitBarcodesSchema.isValidSync([
        {
          barcode: "000.000",
          boom_barrier_id: -1,
          floor_id: 1
        }
      ])
    ).toBe(false);
  });
});

describe("yupCoordinateStringSchema", () => {
  test("good", () => {
    expect(yupCoordinateStringSchema.isValidSync("6,7")).toBe(true);
    expect(yupCoordinateStringSchema.isValidSync("634,7343")).toBe(true);
    expect(yupCoordinateStringSchema.isValidSync("0,0")).toBe(true);
  });
  test("bad", () => {
    expect(yupCoordinateStringSchema.isValidSync(3)).toBe(false);
    expect(yupCoordinateStringSchema.isValidSync(",000")).toBe(false);
    expect(yupCoordinateStringSchema.isValidSync("9,10sfsdf")).toBe(false);
    expect(yupCoordinateStringSchema.isValidSync("d,d")).toBe(false);
  });
});

describe("yupDirectionSchema", () => {
  test("good", () => {
    expect(yupDirectionSchema.isValidSync(0)).toBe(true);
    expect(yupDirectionSchema.isValidSync("0")).toBe(true);
    expect(yupDirectionSchema.isValidSync("3")).toBe(true);
  });
  test("bad", () => {
    test("good", () => {
      expect(yupDirectionSchema.isValidSync(-1)).toBe(false);
      expect(yupDirectionSchema.isValidSync("5")).toBe(false);
      expect(yupDirectionSchema.isValidSync("3.5")).toBe(false);
      expect(yupDirectionSchema.isValidSync("4.4")).toBe(false);
    });
  });
});

describe("yupCoordinateListschema", () => {
  test("good", () => {
    expect(
      yupCoordinateListSchema.isValidSync([
        {
          coordinate: "3,3",
          direction: 0
        }
      ])
    ).toBe(true);
    expect(
      yupCoordinateListSchema.isValidSync([
        {
          coordinate: "3,3",
          direction: 0
        },
        {
          coordinate: "2,4",
          direction: 2
        }
      ])
    ).toBe(true);
  });
  test("empty list", () => {
    expect(yupCoordinateListSchema.isValidSync([])).toBe(false);
  });
  test("missing fields", () => {
    expect(
      yupCoordinateListSchema.isValidSync([
        {
          coordinate: "3,3"
        }
      ])
    ).toBe(false);
    expect(
      yupCoordinateListSchema.isValidSync([
        {
          direction: 0
        }
      ])
    ).toBe(false);
  });
});
