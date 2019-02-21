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

//test change of elevator special barcodes
describe("EDIT-BARCODE", () => {
  test("Should change elevator speical barcodes if present", () => {
    var state = {
      "1": {
        elevator_id: "1",
        entry_barcodes: ["001.023","012.012","090.12"],
        exit_barcodes: ["045.012", "023.045", "012.012"]
      }
    };
  
    var newState = elevatorReducer(state, {
      type: "EDIT-BARCODE",
      value: {
        coordinate: "12,12",
        new_barcode: "090.013"
      }
    });
    expect(newState).toEqual({
      "1": {
        elevator_id: "1",
        entry_barcodes: ["001.023","090.013","090.12"],
        exit_barcodes: ["045.012", "023.045", "090.013"]
      }
    });

  });
  test("should not change anything if special barcode does not exist in elevator", () => {
    var state = {
      "1": {
        elevator_id: "1",
        entry_barcodes: ["001.023","090.12"],
        exit_barcodes: ["045.012", "023.045", "023.013"]
      }
    };
  
    var newState = elevatorReducer(state, {
      type: "EDIT-BARCODE",
      value: {
        coordinate: "12,12",
        new_barcode: "090.013"
      }
    });
    expect(newState).toEqual(state);
  });
});