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

describe("REMOVE-ENTITIES-FROM-FLOOR", () => {
  test("should remove pps entities", () => {
    var state = { "1": { ppses: [1, 3, 4, 5, 6] } };
    // 2 to be removeed
    var ppsEntityIds = [1, 2, 3];

    var newState = floorReducer(state, {
      type: "REMOVE-ENTITIES-FROM-FLOOR",
      value: {
        floorKey: "ppses",
        currentFloor: 1,
        ids: ppsEntityIds
      }
    });
    expect(newState).toMatchObject({ "1": { ppses: [4, 5, 6] } });
  });
  test("should remove barcodes entities", () => {
    var state = { "1": { map_values: ["0,1", "0,2", "3,0", "4,0"] } };
    // 2 to be removeed
    var barcodeIds = ["0,2", "3,0", "5,0"];

    var newState = floorReducer(state, {
      type: "REMOVE-ENTITIES-FROM-FLOOR",
      value: {
        floorKey: "map_values",
        currentFloor: 1,
        ids: barcodeIds
      }
    });
    expect(newState).toMatchObject({ "1": { map_values: ["0,1", "4,0"] } });
  });
});
