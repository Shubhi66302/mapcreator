import vanilla3x3 from "test-data/test-maps/3x3-vanilla.json";
import { normalizeMap } from "utils/normalizr";
import { fromJS } from "immutable";
import barcodeReducer from "./barcode.js";

const vanilla3x3BarcodeMap = fromJS(normalizeMap(vanilla3x3).entities.barcode);
const makeState = immutableMap => immutableMap.toJS();

describe("ASSIGN-STORABLE", () => {
  test("should correctly mutate barcodes so that neighbouring rack paths are not traversible", () => {
    var state = makeState(vanilla3x3BarcodeMap);
    // 2x2 square is selected
    var selectedMapTiles = {
      "0,0": true,
      "1,0": true,
      "0,1": true,
      "1,1": true
    };

    var newState = barcodeReducer(state, {
      type: "ASSIGN-STORABLE",
      value: selectedMapTiles
    });

    // check if storable is true for correct barcodes
    var nonStorables = ["2,2", "2,1", "2,0", "0,2", "1,2"];
    expect(newState["1,1"].store_status).toBe(1);
    expect(newState["0,1"].store_status).toBe(1);
    expect(newState["1,0"].store_status).toBe(1);
    expect(newState["0,0"].store_status).toBe(1);
    for (let tileId of nonStorables) {
      expect(newState[tileId].store_status).toBe(0);
    }
    // check neighbour structures of storables
    expect(newState["0,0"].neighbours).toEqual([
      [0, 0, 0],
      [0, 0, 0],
      [1, 1, 0],
      [1, 1, 0]
    ]);
    expect(newState["1,0"].neighbours).toEqual([
      [0, 0, 0],
      [1, 1, 0],
      [1, 1, 0],
      [1, 1, 1]
    ]);
    expect(newState["0,1"].neighbours).toEqual([
      [1, 1, 0],
      [0, 0, 0],
      [1, 1, 1],
      [1, 1, 0]
    ]);
    expect(newState["1,1"].neighbours).toEqual([
      [1, 1, 0],
      [1, 1, 0],
      [1, 1, 1],
      [1, 1, 1]
    ]);
    // check for other barcodes
    for (let tileId of nonStorables) {
      expect(newState[tileId].neighbours).toEqual(state[tileId].neighbours);
    }
  });
  test("should not modify neighbour structure when no storables are connected", () => {
    var state = makeState(vanilla3x3BarcodeMap);
    // 2 unconnected selected tiles
    var selectedMapTiles = { "0,0": true, "2,0": true };

    var newState = barcodeReducer(state, {
      type: "ASSIGN-STORABLE",
      value: selectedMapTiles
    });

    // check if storable is true
    for (let tileId of Object.keys(state)) {
      if (selectedMapTiles[tileId])
        expect(newState[tileId].store_status).toBe(1);
      else expect(newState[tileId].store_status).toBe(0);
    }
    // check neighbour structure
    for (let tileId of Object.keys(state)) {
      expect(newState[tileId].neighbours).toEqual(state[tileId].neighbours);
    }
  });
});

describe("ADD-QUEUE-BARCODES-TO-PPS", () => {
    test("should correctly modify multiple queue barcodes with neighbour changes", () => {
        var state = makeState(vanilla3x3BarcodeMap)
        var action = {
            type: 'ADD-QUEUE-BARCODES-TO-PPS',
            value: {
                pps_id: "1",
                coordinates: ['1,2', '1,1', '1,0']
            }
        }
        var newState = barcodeReducer(state, action);
        expect(newState['1,2'].neighbours).toMatchObject(state['1,2'].neighbours);
        
        expect(newState['1,1'].neighbours).toMatchObject([
            [1,1,1], [1,0,0], [1,0,0],[1,0,0] 
        ]);
        expect(newState['1,0'].neighbours).toMatchObject([
            [0,0,0], [1,0,0],[1,0,0],[1,0,0]
        ])
    })
})