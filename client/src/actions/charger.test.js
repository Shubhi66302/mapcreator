import { createAllChargerBarcodes } from "./charger";
import { makeState, singleFloorVanilla } from "utils/test-helper";
import _ from "lodash";

// TODO: more tests for createAllChargerBarcodes with json checks also
describe("createAllChargerBarcodes", () => {
  describe("should create 5 barcodes: charger barcode, entry barcode, special barcode, and three other neighbour barcodes", () => {
    test("charger at 1,0 and direction is down", () => {
      var initialState = makeState(singleFloorVanilla, 1);
      var barcodesDict = initialState.normalizedMap.entities["barcode"] || {};
      var newChargerBarcodes = _.sortBy(
        createAllChargerBarcodes(
          { charger_direction: 2 },
          "1,0",
          "12,12",
          barcodesDict
        ),
        ["coordinate"]
      );
      expect(newChargerBarcodes).toHaveLength(5);
      // TODO: fix charger barcode neighbour checks once the same is reflected in charger.js
      expect(newChargerBarcodes).toMatchObject([
        {
          botid: "null",
          neighbours: [[0, 0, 0], [0, 0, 0], [1, 1, 1], [1, 0, 0]],
          size_info: [750, 750, 750, 750],
          coordinate: "0,0",
          barcode: "000.000",
          zone: "defzone",
          sector: 0,
          store_status: 0,
          blocked: false
        },
        {
          botid: "null",
          neighbours: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 0, 0]],
          size_info: [750, 750, 205, 750],
          coordinate: "1,0",
          barcode: "000.001",
          zone: "defzone",
          sector: 0,
          adjacency: [null, [0, 0], [12, 12], [2, 0]],
          store_status: 0,
          blocked: false
        },
        {
          botid: "null",
          neighbours: [[1, 1, 0], [1, 1, 1], [1, 1, 1], [1, 1, 1]],
          size_info: [885, 750, 750, 750],
          coordinate: "1,1",
          barcode: "001.001",
          zone: "defzone",
          sector: 0,
          adjacency: [[12, 12], [0, 1], [1, 2], [2, 1]],
          store_status: 0,
          blocked: false
        },
        {
          botid: "null",
          neighbours: [[1, 1, 0], [0, 0, 0], [1, 1, 0], [0, 0, 0]],
          size_info: [205, 750, 205, 750],
          coordinate: "12,12",
          barcode: "012.012",
          zone: "defzone",
          sector: 0,
          adjacency: [[1, 0], null, [1, 1], null],
          special: true,
          store_status: 0,
          blocked: false
        },
        {
          botid: "null",
          neighbours: [[0, 0, 0], [1, 0, 0], [1, 1, 1], [0, 0, 0]],
          size_info: [750, 750, 750, 750],
          coordinate: "2,0",
          barcode: "000.002",
          zone: "defzone",
          sector: 0,
          store_status: 0,
          blocked: false
        }
      ]);
    });
  });
  test("charger at 1,1 and direction is up; should have 6 barcodes", () => {
    var initialState = makeState(singleFloorVanilla, 1);
    var barcodesDict = initialState.normalizedMap.entities["barcode"] || {};
    var newChargerBarcodes = _.sortBy(
      createAllChargerBarcodes(
        { charger_direction: 0 },
        "1,1",
        "12,12",
        barcodesDict
      ),
      ["coordinate"]
    );
    expect(newChargerBarcodes).toHaveLength(6);
    expect(newChargerBarcodes[0]).toMatchObject({
      botid: "null",
      neighbours: [[1, 1, 1], [0, 0, 0], [1, 1, 1], [1, 0, 0]],
      size_info: [750, 750, 750, 750],
      coordinate: "0,1",
      barcode: "001.000",
      zone: "defzone",
      sector: 0,
      store_status: 0,
      blocked: false
    });
  });
});

// TODO: more tests for addChargers
