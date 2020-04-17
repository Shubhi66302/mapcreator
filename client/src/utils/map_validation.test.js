import {
  validateNeighbours
} from "./map_validation";

describe("validateNeighbours", () => {
  test("Sanity should pass", () => {
    var barcodesDict = {
      // map is:
      // -      1,1    -
      //         x
      // 2,2 .. 1,2 .. 0,2
      // this one will be tested
      "1,2": {
        coordinate: "1,2",
        neighbours: [[1, 0, 0], [1, 1, 0], [0, 0, 0], [1, 1, 0]]
      },
      "1,1": {
        coordinate: "1,1",
        neighbours: [[0, 0, 0], [0, 0, 0], [1, 1, 0], [0, 0, 0]]
      },
      "0,2": {
        coordinate: "0,2",
        neighbours: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 1, 1]]
      },
      "2,2": {
        coordinate: "2,2",
        neighbours: [[0, 0, 0], [1, 1, 1], [0, 0, 0], [0, 0, 0]]
      }
    };
    var neighbourBarcodes = validateNeighbours(barcodesDict);
    expect(neighbourBarcodes).toMatchObject({"finalResult": true});
  });
  test("Sanity should fail at 1,2", () => {
    var barcodesDict = {
      // map is:
      // -      1,1    -
      //         x
      // 2,2 .. 1,2 .. 0,2
      // this one will be tested
      "1,2": {
        coordinate: "1,2",
        neighbours: [[1, 0, 0], [1, 1, 0], [0, 1, 0], [1, 1, 0]]
      },
      "1,1": {
        coordinate: "1,1",
        neighbours: [[0, 0, 0], [0, 0, 0], [1, 1, 0], [0, 0, 0]]
      },
      "0,2": {
        coordinate: "0,2",
        neighbours: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 1, 1]]
      },
      "2,2": {
        coordinate: "2,2",
        neighbours: [[0, 0, 0], [1, 1, 1], [0, 0, 0], [0, 0, 0]]
      }
    };
    var neighbourBarcodes = validateNeighbours(barcodesDict);
    expect(neighbourBarcodes).toMatchObject({"finalResult": false, "invalidCoordinateData": ["1,2"]});
  });
  test("Sanity should fail at 1,2 & 2,2", () => {
    var barcodesDict = {
      // map is:
      // -      1,1    -
      //         x
      // 2,2 .. 1,2 .. 0,2
      // this one will be tested
      "1,2": {
        coordinate: "1,2",
        neighbours: [[1, 0, 0], [1, 1, 0], [0, 1, 0], [1, 1, 0]]
      },
      "1,1": {
        coordinate: "1,1",
        neighbours: [[0, 0, 0], [0, 0, 0], [1, 1, 0], [0, 0, 0]]
      },
      "0,2": {
        coordinate: "0,2",
        neighbours: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 1, 1]]
      },
      "2,2": {
        coordinate: "2,2",
        neighbours: [[0, 1, 0], [1, 1, 1], [0, 0, 0], [0, 0, 0]]
      }
    };
    var neighbourBarcodes = validateNeighbours(barcodesDict);
    expect(neighbourBarcodes).toMatchObject({"finalResult": false, "invalidCoordinateData": ["1,2", "2,2"]});
  });
});
