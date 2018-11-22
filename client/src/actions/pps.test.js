import mapSchema from "common/json-schemas/map.json";
import getLoadedAjv from "common/utils/get-loaded-ajv";
import { makeState, singleFloor } from "utils/test-helper";
import { createNewPPSes } from "./pps";

var ajv = getLoadedAjv();
ajv.addSchema(mapSchema.properties.queueDatas, "queueDatasSchema");

describe("createNewPPSes", () => {
  test("should return valid ppses that pass json validation also", () => {
    const initialState = makeState(singleFloor, 1, {
      "2,2": true,
      "0,2": true
    });
    const newPPSes = createNewPPSes({ pick_direction: 0 }, initialState);
    expect(newPPSes).toMatchObject([
      {
        coordinate: "2,2",
        location: "002.002",
        status: "disconnected",
        queue_barcodes: [],
        pick_position: "002.002",
        pick_direction: 0,
        put_docking_positions: [],
        allowed_modes: ["put", "pick", "audit"]
      },
      {
        coordinate: "0,2",
        location: "002.000",
        status: "disconnected",
        queue_barcodes: [],
        pick_position: "002.000",
        pick_direction: 0,
        put_docking_positions: [],
        allowed_modes: ["put", "pick", "audit"]
      }
    ]);
  });
});

// TODO: add tests for addPPSes action
