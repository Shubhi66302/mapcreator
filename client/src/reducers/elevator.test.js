import elevatorReducer from "./elevator";

describe("EDIT-ELEVATOR-COORDINATES", () => {
  test("Should add a new coordinate to the elevator", () => {
    var state = {
      "1": {
        elevator_id: "1",
        coordinate_list: [{ coordinate: [1, 10], direction: 2 }]
      }
    };
    var newState = elevatorReducer(state, {
      type: "EDIT-ELEVATOR-COORDINATES",
      value: {
        elevator_id: 1,
        coordinate_list: [
          { coordinate: [1, 10], direction: 2 },
          { coordinate: [20, 30], direction: 2 }
        ]
      }
    });
    expect(newState).toEqual({
      "1": {
        elevator_id: "1",
        coordinate_list: [
          { coordinate: [1, 10], direction: 2 },
          { coordinate: [20, 30], direction: 2 }
        ]
      }
    });
  });
});
