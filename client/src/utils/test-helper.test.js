import { twoFloors } from "./test-helper";

describe("twoFloors", () => {
  test("should have two floors", () => {
    expect(twoFloors.getIn(["map", "floors"]).size).toBe(2);
    expect(twoFloors.getIn(["map", "floors", 1, "map_values"]).size).toBe(2);
  });
});
