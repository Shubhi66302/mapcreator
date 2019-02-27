import mapReducer from "./map";

describe("DELETE-ELEVATOR-BY-ID", () => {
  test("Should delete elevator and related data", () => {
    var defaultState =  {
      dummy: {
        elevators: [1,2,3],
        floors: [1],
        id: "dummy",
        queueDatas : [],
        zones: ["defzone"]
      }
    };
    // var state = createState(complicated3x3ElevatorMap);
    var newState = mapReducer(defaultState, {
      type: "DELETE-ELEVATOR-BY-ID",
      value: 1
    });
    expect(newState.dummy.elevators).toEqual([2,3]);
    
  });
});