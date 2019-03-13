import { addElevator as addElevatorActionCreator } from "actions/elevator";
import { addElevator, editElevatorCoordinates } from "./elevator-barcodes";
import { fromJS } from "immutable";
import { normalizeMap } from "utils/normalizr";
import vanilla3x3 from "test-data/test-maps/3x3-vanilla.json";

const vanilla3x3BarcodeMap = fromJS(normalizeMap(vanilla3x3).entities.barcode);
const makeState = immutableMap => immutableMap.toJS();

// TODO: wr4ite tests for changeElevatorCoordinates

describe("addElevator", () => {
  test("Should actually not do anything since on adding elevator, there is just one coordinate in elevator's coordinate_list", () => {
    var state = makeState(vanilla3x3BarcodeMap);
    var newState = addElevator(
      state,
      addElevatorActionCreator({
        elevator_id: 1,
        position: "001.002",
        type: "c_type",
        coordinate_list: ["2,1"]
      })
    );
    expect(newState).toEqual(state);
  });
});

describe("editElevatorCoordinates", () => {
  var state = makeState(vanilla3x3BarcodeMap);
  var newState = editElevatorCoordinates(state, {
    type: "EDIT-ELEVATOR-COORDINATES",
    value: {
      elevator_id: 1,
      old_coordinate_list: [{ coordinate: [2, 1], direction: 2 }],
      elevator_position: "002.001",
      coordinate_list: [
        { coordinate: [2, 1], direction: 2 },
        { coordinate: [1, 1], direction: 2 },
        { coordinate: [0, 1], direction: 2 }
      ]
    }
  });
  expect(newState["1,2"]).toEqual({ ...state["1,2"], barcode: "002.001" });
  expect(newState["1,1"]).toEqual({ ...state["1,1"], barcode: "002.001" });
  expect(newState["0,1"]).toEqual({ ...state["0,1"], barcode: "002.001" });
  expect(newState["0,0"]).toEqual({ ...state["0,0"], barcode: "000.000" });
});
