
import chargerReducer from "./charger";
describe("EDIT-BARCODE", () => {
  test("should test if charger spl barcodes change due to new barcode", () => {
    var state = {"1":
                {
                  "charger_direction": 0,
                  "charger_id": "1",
                  "charger_location": "021.045",
                  "charger_type": "rectangular_plate_charger",
                  "coordinate": "45,21",
                  "entry_point_direction": 0,
                  "entry_point_location": "012.012",
                  "mode": "manual",
                  "reinit_point_direction": 0,
                  "reinit_point_location": "012.012",
                  "status": "disconnected"
                },
    "2":
                {
                  "charger_direction": 0,
                  "charger_id": "1",
                  "charger_location": "021.043",
                  "charger_type": "rectangular_plate_charger",
                  "coordinate": "43,21",
                  "entry_point_direction": 0,
                  "entry_point_location": "011.011",
                  "mode": "manual",
                  "reinit_point_direction": 0,
                  "reinit_point_location": "011.011",
                  "status": "disconnected"
                }
    };
    var new_state = chargerReducer(state, {
      type: "EDIT-BARCODE",
      value: {
        coordinate: "12,12",
        new_barcode: "090.013"
      }
    });
    expect(new_state[1].entry_point_location).toEqual("090.013");
    expect(new_state[1].reinit_point_location).toEqual("090.013");
    expect(new_state[2]).toEqual(new_state[2]);
  });

  test("should test if charger does not have any special barcodes then nothing changes", () => {
    var state = {"1":
                {
                  "charger_direction": 0,
                  "charger_id": "1",
                  "charger_location": "021.045",
                  "charger_type": "rectangular_plate_charger",
                  "coordinate": "45,21",
                  "entry_point_direction": 0,
                  "entry_point_location": "012.012",
                  "mode": "manual",
                  "reinit_point_direction": 0,
                  "reinit_point_location": "012.012",
                  "status": "disconnected"
                }
    };
    var new_state = chargerReducer(state, {
      type: "EDIT-BARCODE",
      value: {
        coordinate: "11,11",
        new_barcode: "090.013"
      }
    });
    expect(new_state).toEqual(state);
  });
});
