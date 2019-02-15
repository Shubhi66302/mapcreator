import { parseCoordinateString, findFloorIndex } from "./util";

describe("parseCoordinateString", () => {
  test("good coordinate", () => {
    expect(parseCoordinateString("[31,35]")).toEqual("31,35");
    expect(parseCoordinateString("[31, 35]")).toEqual("31,35");
  });
});

describe("findFloorIndex", () => {
  var floors = [
    { floor_id: 1, map_values: [{ barcode: "021.022" }] },
    { floor_id: 2, map_values: [{ barcode: "023.024" }] }
  ];
  test("exists", () => {
    expect(findFloorIndex(floors, "021.022")).toBe(0);
    expect(findFloorIndex(floors, "023.024")).toBe(1);
  });
  test("doesnt", () => {
    expect(findFloorIndex(floors, "025.066")).toBe(-1);
  });
});
