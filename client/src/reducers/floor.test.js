import floorReducer from "./floor";

describe("ADD-ENTITIES-TO-FLOOR", () => {
  test("should adds a pps entity to an existing floor", () => {
    var state = { "1": { ppses: [] } };
    // 2 new pps entities are created
    var ppsEntityIds = [1, 2];

    var newState = floorReducer(state, {
      type: "ADD-ENTITIES-TO-FLOOR",
      value: {
        floorKey: "ppses",
        currentFloor: 1,
        ids: ppsEntityIds
      }
    });
    expect(newState).toEqual({ "1": { ppses: [1, 2] } });
  });

  test("should add ppses and update some existing ppses to an existing floor", () => {
    var state = { "1": { ppses: [2, 3] } };
    // 1 is added, 2, 3 are updated
    var ppsEntityIds = [1, 2, 3];

    var newState = floorReducer(state, {
      type: "ADD-ENTITIES-TO-FLOOR",
      value: {
        floorKey: "ppses",
        currentFloor: 1,
        ids: ppsEntityIds
      }
    });
    expect(newState).toEqual({ "1": { ppses: [2, 3, 1] } });
  });

  test("should not add anything if floor doesn't axist", () => {
    var state = { "1": { ppses: [2, 3] } };

    var newState = floorReducer(state, {
      type: "ADD-ENTITIES-TO-FLOOR",
      value: {
        floorKey: "ppses",
        currentFloor: 2,
        ids: [3, 4]
      }
    });
    expect(newState).toEqual(state);
  });

  test("should add entities even if entities array didn't exist before", () => {
    var state = { "1": { chargers: [1, 2] } };

    var newState = floorReducer(state, {
      type: "ADD-ENTITIES-TO-FLOOR",
      value: {
        floorKey: "ppses",
        currentFloor: 1,
        ids: [1, 2, 3]
      }
    });
    expect(newState).toEqual({ "1": { chargers: [1, 2], ppses: [1, 2, 3] } });
  });
});
