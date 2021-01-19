
import ppsReducer from "./pps";

describe("ppsReducer", () => {
  test("adds queue into pps", () => {
    const state = { "1": { pps_id: 1, coordinate: "1,1" } };
    const newState = ppsReducer(state, {
      type: "ADD-QUEUE-BARCODES-TO-PPS",
      value: {pps_id:1,tiles: ["001.002", "001.001", "001.003"] , current_queue_barcodes: []}
    });
    expect(newState).toMatchObject({
      "1": {
        pps_id: 1,
        coordinate: "1,1",
        queue_barcodes: ["001.002", "001.001", "001.003"]
      }
    });
  });
  test("test delete queue from pps", () => {
    const state = { "1": { pps_id: 1, coordinate: "1,1", 
      queue_coordinates: ["2,1","1,1","3,1"]} };
    const newState = ppsReducer(state, {
      type: "DELETE-PPS-QUEUE",
      value: {pps_id: 1, queue_coordinates: ["2,1","1,1","3,1"]}
    });
    expect(newState).toMatchObject({
      "1": {
        pps_id: 1,
        coordinate: "1,1",
        queue_barcodes: []
      }
    });
  });
});