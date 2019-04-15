require("dotenv").config({ path: ".env.test" });
import elevatorSchema from "common/json-schemas/elevator.json";
import definitionsSchema from "common/json-schemas/definitions.json";
import goodElevators from "test-data/test-jsons/good-elevators.json";

var Ajv = require("ajv");
var ajv = new Ajv({ schemas: [elevatorSchema, definitionsSchema] }); // options can be passed, e.g. {allErrors: true}
var validate = ajv.getSchema("elevator");

describe("valid elevator", () => {
  test("normal elevator", () => {
    var elevator = {
      coordinate_list: [
        { direction: 2, coordinate: [19, 16] },
        { direction: 2, coordinate: [19, 16] }
      ],
      type: "c_type",
      entry_barcodes: [{ boom_barrier_id: 1, floor_id: 1, barcode: "015.019" }],
      exit_barcodes: [{ boom_barrier_id: 3, floor_id: 1, barcode: "017.019" }],
      elevator_id: 1,
      position: "016.019",
      reinit_barcodes: [{ barcodes: ["016.020"], floor_id: 1 }]
    };
    expect(validate(elevator)).toBe(true);
  });
  test("from good-elevators.json", () => {
    goodElevators.forEach(elevator => expect(validate(elevator)).toBe(true));
  });
  test("valid boom_barrier_id", () => {
    var elevator = {
      coordinate_list: [
        { direction: 2, coordinate: [19, 16] },
        { direction: 2, coordinate: [19, 16] }
      ],
      type: "c_type",
      entry_barcodes: [{ boom_barrier_id: 7, floor_id: 1, barcode: "015.019" }],
      exit_barcodes: [{ boom_barrier_id: 10, floor_id: 1, barcode: "017.019" }],
      elevator_id: 1,
      position: "016.019",
      reinit_barcodes: [{ barcodes: ["016.020"], floor_id: 1 }]
    };
    expect(validate(elevator)).toBe(true);
  });
});

describe("invalid elevator", () => {
  test("no position", () => {
    var elevator = {
      coordinate_list: [
        { direction: 2, coordinate: [19, 16] },
        { direction: 2, coordinate: [19, 16] }
      ],
      type: "c_type",
      entry_barcodes: [{ boom_barrier_id: 1, floor_id: 1, barcode: "015.019" }],
      exit_barcodes: [{ boom_barrier_id: 3, floor_id: 1, barcode: "017.019" }],
      elevator_id: 1,
      reinit_barcodes: [{ barcodes: ["016.020"], floor_id: 1 }]
    };
    expect(validate(elevator)).toBe(false);
  });
  test("invalid elevator type", () => {
    var elevator = {
      coordinate_list: [
        { direction: 2, coordinate: [19, 16] },
        { direction: 2, coordinate: [19, 16] }
      ],
      position: "001.002",
      type: "f_type",
      entry_barcodes: [{ boom_barrier_id: 1, floor_id: 1, barcode: "015.019" }],
      exit_barcodes: [{ boom_barrier_id: 3, floor_id: 1, barcode: "017.019" }],
      elevator_id: 1,
      reinit_barcodes: [{ barcodes: ["016.020"], floor_id: 1 }]
    };
    expect(validate(elevator)).toBe(false);
  });
  test("invalid direction in coordinate_list", () => {
    var elevator = {
      coordinate_list: [
        { direction: 5, coordinate: [19, 16] },
        { direction: 2, coordinate: [19, 16] }
      ],
      position: "001.002",
      type: "c_type",
      entry_barcodes: [{ boom_barrier_id: 3, floor_id: 1, barcode: "015.019" }],
      exit_barcodes: [{ boom_barrier_id: 3, floor_id: 1, barcode: "017.019" }],
      elevator_id: 1,
      reinit_barcodes: [{ barcodes: ["016.020"], floor_id: 1 }]
    };
    expect(validate(elevator)).toBe(false);
  });
  test("missing boom_barrier_id in entry barcode", () => {
    var elevator = {
      coordinate_list: [
        { direction: 4, coordinate: [19, 16] },
        { direction: 2, coordinate: [19, 16] }
      ],
      position: "001.002",
      type: "c_type",
      entry_barcodes: [{ floor_id: 1, barcode: "015.019" }],
      exit_barcodes: [{ boom_barrier_id: 3, floor_id: 1, barcode: "017.019" }],
      elevator_id: 1,
      reinit_barcodes: [{ barcodes: ["016.020"], floor_id: 1 }]
    };
    expect(validate(elevator)).toBe(false);
  });
  test("invalid boom_barrier_id", () => {
    var elevator = {
      coordinate_list: [
        { direction: 2, coordinate: [19, 16] },
        { direction: 2, coordinate: [19, 16] }
      ],
      type: "c_type",
      entry_barcodes: [
        { boom_barrier_id: -1, floor_id: 1, barcode: "015.019" }
      ],
      exit_barcodes: [
        { boom_barrier_id: "abc", floor_id: 1, barcode: "017.019" }
      ],
      elevator_id: 1,
      position: "016.019",
      reinit_barcodes: [{ barcodes: ["016.020"], floor_id: 1 }]
    };
    expect(validate(elevator)).toBe(false);
  });
});
