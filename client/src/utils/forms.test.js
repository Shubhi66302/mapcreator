import { listOfBarcodesSchema } from "./forms";

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
