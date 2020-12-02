import {
  checkNeighbourStructureConsistency,
  checkIfAisleToStorageAndVisavis,
  checkDeadGridPositions,
  validateAlignmentOfCoordinates
} from "./map-validation";

describe("checkNeighbourStructureConsistency", () => {
  test("Sanity should pass to check neighbour structure consistency", () => {
    var barcodesDict = {
      // map is:
      // -      1,1    -
      //      500,500
      // 2,2 .. 1,2 .. 0,2
      // this one will be tested
      "1,2": {
        coordinate: "1,2",
        neighbours: [[1, 0, 0], [1, 1, 0], [0, 0, 0], [1, 1, 0]],
        adjacency: [[500,500], [0,2], null, [2,2]]
      },
      "1,1": {
        coordinate: "1,1",
        neighbours: [[0, 0, 0], [0, 0, 0], [1, 1, 0], [0, 0, 0]],
        adjacency: [null, null, [500,500], null]
      },
      "0,2": {
        coordinate: "0,2",
        neighbours: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 1, 1]]
      },
      "2,2": {
        coordinate: "2,2",
        neighbours: [[0, 0, 0], [1, 1, 1], [0, 0, 0], [0, 0, 0]]
      },
      "500,500": {
        coordinate: "500,500",
        neighbours: [[1, 1, 0], [0, 0, 0], [1, 1, 0], [0, 0, 0]],
        adjacency: [[1,1], null, [1,2], null]
      }
    };
    var neighbourBarcodes = checkNeighbourStructureConsistency(barcodesDict);
    expect(neighbourBarcodes).toMatchObject([]);
  });
  test("checks if neighbours according to the neighbour structure actually exists in gridinfo.", () => {
    var barcodesDict = {
      // map is:
      // -      1,1    -removed this
      //         x
      // 2,2 .. 1,2 .. 0,2
      // this one will be tested
      "1,2": {
        coordinate: "1,2",
        neighbours: [[1, 0, 0], [1, 1, 0], [0, 0, 0], [1, 1, 0]],
      },
      // "1,1": {
      //   coordinate: "1,1",
      //   neighbours: [[0, 0, 0], [0, 0, 0], [1, 1, 0], [0, 0, 0]],
      // },
      "0,2": {
        coordinate: "0,2",
        neighbours: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 1, 1]]
      },
      "2,2": {
        coordinate: "2,2",
        neighbours: [[0, 0, 0], [1, 1, 1], [0, 0, 0], [0, 0, 0]]
      }
    };
    var neighbourBarcodes = checkNeighbourStructureConsistency(barcodesDict);
    expect(neighbourBarcodes).toMatchObject(["1,2"]);
  });
  test("If bot movement is not allowed, rack movement (R) should not be allowed.", () => {
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
        neighbours: [[0, 0, 0], [1, 0, 1], [0, 0, 0], [0, 0, 0]]
      }
    };
    var neighbourBarcodes = checkNeighbourStructureConsistency(barcodesDict);
    expect(neighbourBarcodes).toMatchObject(["2,2"]);
  });
  test("If the neighbour does not exist (E), bot movement (B) should not be allowed.", () => {
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
    var neighbourBarcodes = checkNeighbourStructureConsistency(barcodesDict);
    expect(neighbourBarcodes).toMatchObject(["1,2", "2,2"]);
  });
});

describe("checkIfAisleToStorageAndVisavis", () => {
  test("Sanity should pass to check if aisle to storage and visavis", () => {
    var barcodesDict = {
      // map is:
      // -      1,1    -
      // 2,2 .. 1,2 .. 0,2
      // this one will be tested
      "1,2": {
        coordinate: "1,2",
        neighbours: [[1, 0, 0], [1, 1, 1], [0, 0, 0], [1, 1, 1]],
        store_status: 1
      },
      "1,1": {
        coordinate: "1,1",
        neighbours: [[0, 0, 0], [0, 0, 0], [1, 1, 0], [0, 0, 0]],
        store_status: 0
      },
      "0,2": {
        coordinate: "0,2",
        neighbours: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 1, 1]],
        store_status: 0
      },
      "2,2": {
        coordinate: "2,2",
        neighbours: [[0, 0, 0], [1, 1, 1], [0, 0, 0], [0, 0, 0]],
        store_status: 0
      },
    };
    var neighbourBarcodes = checkIfAisleToStorageAndVisavis(barcodesDict);
    expect(neighbourBarcodes).toMatchObject([]);
  });
  test("the rack movement must be allowed from aisle to storable and from storable to aisle", () => {
    var barcodesDict = {
      // map is:
      // -      1,1    -
      // 2,2 .. 1,2 .. 0,2
      // this one will be tested
      "1,2": {
        coordinate: "1,2",
        neighbours: [[1, 0, 0], [1, 1, 0], [0, 0, 0], [1, 1, 1]],
        store_status: 1
      },
      "1,1": {
        coordinate: "1,1",
        neighbours: [[0, 0, 0], [0, 0, 0], [1, 1, 0], [0, 0, 0]],
        store_status: 0
      },
      "0,2": {
        coordinate: "0,2",
        neighbours: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 1, 1]],
        store_status: 0
      },
      "2,2": {
        coordinate: "2,2",
        neighbours: [[0, 0, 0], [1, 1, 1], [0, 0, 0], [0, 0, 0]],
        store_status: 0
      },
    };
    var neighbourBarcodes = checkIfAisleToStorageAndVisavis(barcodesDict);
    expect(neighbourBarcodes).toMatchObject([[{"Coor1ToCoor2Dir": 1, "coordinateKey1": "1,2"}, {"Coor2ToCoor1Dir": 3, "coordinateKey2": "0,2"}]]);
  });

  test("the rack movement must be allowed from aisle to storable and from storable to aisle with adjacency", () => {
    var barcodesDict = {
      // map is:
      // -      1,1    -
      //      500,500
      // 2,2 .. 1,2 .. 0,2
      // this one will be tested
      "1,2": {
        coordinate: "1,2",
        neighbours: [[1, 1, 1], [1, 1, 1], [0, 0, 0], [1, 1, 1]],
        adjacency: [[500,500], [0,2], null, [2,2]],
        store_status: 1
      },
      "1,1": {
        coordinate: "1,1",
        neighbours: [[0, 0, 0], [0, 0, 0], [1, 1, 1], [0, 0, 0]],
        adjacency: [null, null, [500,500], null],
        store_status: 0
      },
      "0,2": {
        coordinate: "0,2",
        neighbours: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 1, 1]],
        store_status: 0
      },
      "2,2": {
        coordinate: "2,2",
        neighbours: [[0, 0, 0], [1, 1, 1], [0, 0, 0], [0, 0, 0]],
        store_status: 0
      },
      "500,500": {
        coordinate: "500,500",
        neighbours: [[1, 1, 1], [0, 0, 0], [1, 1, 1], [0, 0, 0]],
        adjacency: [[1,1], null, [1,2], null],
        store_status: 0
      }
    };
    var neighbourBarcodes = checkIfAisleToStorageAndVisavis(barcodesDict);
    expect(neighbourBarcodes).toMatchObject([]);
  });
});

describe("checkDeadGridPositions", () => {
  test("Sanity should pass to check if no dead grid found", () => {
    var barcodesDict = {
      // map is:
      // -      1,1    -
      // 2,2 .. 1,2 .. 0,2
      // this one will be tested
      "1,2": {
        coordinate: "1,2",
        neighbours: [[1, 0, 0], [1, 1, 1], [0, 0, 0], [1, 1, 1]]
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
      },
    };
    var neighbourBarcodes = checkDeadGridPositions(barcodesDict);
    expect(neighbourBarcodes).toMatchObject([]);
  });
  test("Should fail as 1,2 is a dead coordinate", () => {
    var barcodesDict = {
      // map is:
      // -      1,1    -
      // 2,2 .. 1,2 .. 0,2
      // this one will be tested
      "1,2": {
        coordinate: "1,2",
        neighbours: [[1, 0, 0], [1, 1, 0], [0, 0, 0], [1, 1, 0]]
      },
      "1,1": {
        coordinate: "1,1",
        neighbours: [[0, 0, 0], [0, 0, 0], [1, 1, 1], [0, 0, 0]]
      },
      "0,2": {
        coordinate: "0,2",
        neighbours: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 1, 1]]
      },
      "2,2": {
        coordinate: "2,2",
        neighbours: [[0, 0, 0], [1, 1, 1], [0, 0, 0], [0, 0, 0]]
      },
    };
    var neighbourBarcodes = checkDeadGridPositions(barcodesDict);
    expect(neighbourBarcodes).toMatchObject(
      [[{"coordinateKey": "1,2", "oppNeighbourToCoordDir": 0},
        {"neighbourCord": "1,1", "neighbourToCoordDir": 2}],
      [{"coordinateKey": "1,2", "oppNeighbourToCoordDir": 1},
        {"neighbourCord": "0,2", "neighbourToCoordDir": 3}],
      [{"coordinateKey": "1,2", "oppNeighbourToCoordDir": 3},
        {"neighbourCord": "2,2", "neighbourToCoordDir": 1}]]);
  });
});

describe("validateAlignmentOfCoordinates", () => {
  test("Sanity shouldnot pass at [500,500] at north, [1,2] at left,[1,1] at south,[2,2] at right ", () => {
    var barcodesDict = {
      // map is:
      // -      1,1    -
      //      500,500
      // 2,2 .. 1,2 .. 0,2
      // this one will be tested
      "1,2": {
        coordinate: "1,2",
        neighbours: [[1, 0, 0], [1, 1, 0], [0, 0, 0], [1, 1, 0]],
        adjacency: [[500,500], [0,2], null, [2,2]],
        world_coordinate : "[4,2]"
      },
      "1,1": {
        coordinate: "1,1",
        neighbours: [[0, 0, 0], [0, 0, 0], [1, 1, 0], [0, 0, 0]],
        adjacency: [null, null, [500,500], null],
        world_coordinate: "[3,8]"
      },
      "0,2": {
        coordinate: "0,2",
        neighbours: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 1, 1]],
        world_coordinate: "[1,2]"
      },
      "2,2": {
        coordinate: "2,2",
        neighbours: [[0, 0, 0], [1, 1, 1], [0, 0, 0], [0, 0, 0]],
        world_coordinate: "[3,1]"
      },
      "500,500": {
        coordinate: "500,500",
        neighbours: [[1, 1, 0], [0, 0, 0], [1, 1, 0], [0, 0, 0]],
        adjacency: [[1,1], null, [1,2], null],
        world_coordinate: "[4,9]"
      }
    };
    var neighbourBarcodes = validateAlignmentOfCoordinates(barcodesDict);
    expect(neighbourBarcodes).toMatchObject([
      [[1, 2], [{"left": [2, 2]}]],
      [[1, 1], [{"south": [500, 500]}]],
      [[2, 2], [{"right": [1, 2]}]],
      [[500, 500], [{"north": [1, 1]}]]
    ]);
  });
  test("Sanity should pass", () => {
    var barcodesDict = {
      // map is:
      // -      1,1    -
      //      500,500
      // 2,2 .. 1,2 .. 0,2
      // this one will be tested
      "1,2": {
        coordinate: "1,2",
        neighbours: [[1, 0, 0], [1, 1, 0], [0, 0, 0], [1, 1, 0]],
        adjacency: [[500,500], [0,2], null, [2,2]],
        world_coordinate : "[2,2]"
      },
      "1,1": {
        coordinate: "1,1",
        neighbours: [[0, 0, 0], [0, 0, 0], [1, 1, 0], [0, 0, 0]],
        adjacency: [null, null, [500,500], null],
        world_coordinate: "[2,8]"
      },
      "0,2": {
        coordinate: "0,2",
        neighbours: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [1, 1, 1]],
        world_coordinate: "[1,2]"
      },
      "2,2": {
        coordinate: "2,2",
        neighbours: [[0, 0, 0], [1, 1, 1], [0, 0, 0], [0, 0, 0]],
        world_coordinate: "[3,2]"
      },
      "500,500": {
        coordinate: "500,500",
        neighbours: [[1, 1, 0], [0, 0, 0], [1, 1, 0], [0, 0, 0]],
        adjacency: [[1,1], null, [1,2], null],
        world_coordinate: "[2,9]"
      }
    };
    var neighbourBarcodes = validateAlignmentOfCoordinates(barcodesDict);
    expect(neighbourBarcodes).toMatchObject([]);
  });
});
