import {
  validateChargersLayout,
  ValidateChargerLayout,
  checkIfRackMovementAllowedToCoordinateFromNeighbours,
  validateChargerCoordinate,
  validateBidirectionalMovementBetween2Coordinates
} from "./charger-data-sanity";
import { singleFloorVanilla, singleFloorVanillaCharger, makeState } from "./test-helper";

describe("checkIfRackMovementAllowedToCoordinateFromNeighbours", () => {
  test("if no neighbour allows rack movement to the coordinate", () => {
    var barcodesDict = makeState(singleFloorVanilla, 1).normalizedMap.entities.barcode;
    // barcode
    // 2,0        1,0            0,0
    // 2,1        1,1            0,1
    // 2,2        1,2            0,2
    const chargerCoordinate = "1,2";
    barcodesDict["2,2"].neighbours[1] = [1, 1, 0];
    barcodesDict["1,1"].neighbours[2] = [1, 1, 0];
    barcodesDict["0,2"].neighbours[3] = [1, 1, 0];
    var sanityTest = checkIfRackMovementAllowedToCoordinateFromNeighbours(chargerCoordinate, barcodesDict);
    expect(sanityTest).toEqual({ "invalidNeigbbours": [], "isRackMovementAllowed": false });
  });
  test("if no neighbour allows rack movement to the coordinate", () => {
    var barcodesDict = makeState(singleFloorVanilla, 1).normalizedMap.entities.barcode;
    //  barcode
    // 2,0        1,0            0,0
    // 2,1        1,1            0,1
    // 2,2        1,2            0,2  
    const chargerCoordinate = "1,2";
    barcodesDict["2,2"].neighbours[1] = [1, 1, 1];
    barcodesDict["1,1"].neighbours[2] = [1, 1, 0];
    barcodesDict["0,2"].neighbours[3] = [1, 1, 0];
    var sanityTest = checkIfRackMovementAllowedToCoordinateFromNeighbours(chargerCoordinate, barcodesDict);
    expect(sanityTest).toEqual({ "invalidNeigbbours": [{ "coordinate": "2,2", "direction": 3 }], "isRackMovementAllowed": true });
  });
  test("if rack movement is allowed from the coordinate", () => {
    var barcodesDict = makeState(singleFloorVanilla, 1).normalizedMap.entities.barcode;
    //  barcode
    // 2,0        1,0            0,0
    // 2,1        1,1            0,1
    // 2,2        1,2            0,2  
    const chargerCoordinate = "1,2";
    barcodesDict["2,2"].neighbours[1] = [1, 1, 0];
    barcodesDict["1,1"].neighbours[2] = [1, 1, 0];
    barcodesDict["0,2"].neighbours[3] = [1, 1, 0];
    barcodesDict["1,2"].neighbours[0] = [1, 1, 1];
    var sanityTest = checkIfRackMovementAllowedToCoordinateFromNeighbours(chargerCoordinate, barcodesDict);
    expect(sanityTest).toEqual({ "invalidNeigbbours": [], "isRackMovementAllowed": false });
  });
});

describe("validateChargerCoordinate", () => {
  // barcode
  // 2,0        1,0            0,0
  // 2,1        1,1            0,1
  // 2,2        1,2            0,2
  // 1,2 <- charger. 
  test("if charger has only one accesible neighbour", () => {
    var barcodesDict = makeState(singleFloorVanilla, 1).normalizedMap.entities.barcode;
    const chargerCoordinate = "1,2";
    barcodesDict["1,2"].neighbours = [[1, 1, 0], [1, 0, 0], [0, 0, 0], [1, 0, 0]];
    barcodesDict["1,1"].neighbours[2] = [1, 1, 0];
    barcodesDict["2,2"].neighbours[1] = [1, 0, 0];
    barcodesDict["0,2"].neighbours[3] = [1, 0, 0];
    var charger_direction = 0;
    var sanityTest = validateChargerCoordinate(chargerCoordinate, charger_direction, barcodesDict);
    expect(sanityTest).toEqual({ "IsValidChargerCoordinate": true });
  });
  test("if charger has only one accesible neighbour , but not charger direction", () => {
    var barcodesDict = makeState(singleFloorVanilla, 1).normalizedMap.entities.barcode;
    const chargerCoordinate = "1,2";
    barcodesDict["1,2"].neighbours = [[1, 1, 0], [1, 0, 0], [0, 0, 0], [1, 0, 0]];
    barcodesDict["1,1"].neighbours[2] = [1, 1, 0];
    barcodesDict["2,2"].neighbours[1] = [1, 0, 0];
    barcodesDict["0,2"].neighbours[3] = [1, 0, 0];
    var charger_direction = 1;
    var sanityTest = validateChargerCoordinate(chargerCoordinate, charger_direction, barcodesDict);
    expect(sanityTest).toEqual({
      "IsValidChargerCoordinate": false,
      "invalidNeigbboursThatAllowAccessInWrongDirection": ["1,1"]
    }
    );
  });
  test("if more than 1 neighbour allow movement to charger ", () => {
    var barcodesDict = makeState(singleFloorVanilla, 1).normalizedMap.entities.barcode;
    const chargerCoordinate = "1,2";
    barcodesDict["1,2"].neighbours = [[1, 1, 0], [1, 0, 0], [0, 0, 0], [1, 0, 0]];
    barcodesDict["2,2"].neighbours[1] = [1, 1, 1];
    barcodesDict["1,1"].neighbours[2] = [1, 1, 0];
    var charger_direction = 0;
    var sanityTest = validateChargerCoordinate(chargerCoordinate, charger_direction, barcodesDict);
    expect(sanityTest).toEqual({
      "IsValidChargerCoordinate": false,
      "invalidNeigbboursThatAllowAccess": ["1,1", "0,2", "2,2"]
    });
  });
  test("if more than 1 neighbour movement is allowed from charger", () => {
    var barcodesDict = makeState(singleFloorVanilla, 1).normalizedMap.entities.barcode;
    //  barcode
    // 2,0        1,0            0,0
    // 2,1        1,1            0,1
    // 2,2        1,2            0,2  
    const chargerCoordinate = "1,2";
    barcodesDict["1,2"].neighbours = [[1, 1, 0], [1, 1, 0], [0, 0, 0], [1, 0, 0]];
    barcodesDict["1,1"].neighbours[2] = [1, 1, 0];
    var charger_direction = 0;
    var sanityTest = validateChargerCoordinate(chargerCoordinate, charger_direction, barcodesDict);
    expect(sanityTest).toEqual({
      "IsValidChargerCoordinate": false,
      "invalidNeigbboursReachablefromCharger": ["1,1", "0,2"]
    });
  });
  test("if movement is not allowed from the charger , but movement is allowed to the charger", () => {
    var barcodesDict = makeState(singleFloorVanilla, 1).normalizedMap.entities.barcode;
    //  barcode
    // 2,0        1,0            0,0
    // 2,1        1,1            0,1
    // 2,2        1,2            0,2  
    const chargerCoordinate = "1,2";
    barcodesDict["1,2"].neighbours = [[1, 0, 0], [1, 0, 0], [0, 0, 0], [1, 0, 0]];
    barcodesDict["1,1"].neighbours[2] = [1, 1, 0];
    var charger_direction = 0;
    var sanityTest = validateChargerCoordinate(chargerCoordinate, charger_direction, barcodesDict);
    expect(sanityTest).toEqual({
      "IsValidChargerCoordinate": false,
      "invalidNeigbboursReachablefromCharger": []
    });
  });
});

describe("validateBidirectionalMovement", () => {
  // barcode
  // 2,0        1,0            0,0
  // 2,1        1,1            0,1
  // 2,2        1,2            0,2
  // 1,2 <- charger.
  // bidirectional movement between entry and charger coordinate.
  test("if bi-directional movement if strict bidirectional movement is possible from charger coordinate to entry exists", () => {
    var barcodesDict = makeState(singleFloorVanilla, 1).normalizedMap.entities.barcode;
    const chargerCoordinate = "1,2";
    const entryCoordinate = "1,1";
    barcodesDict["1,2"].neighbours = [[1, 1, 0], [1, 0, 0], [0, 0, 0], [1, 0, 0]];
    barcodesDict["1,0"].neighbours = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 0, 0]];
    barcodesDict["1,1"].neighbours = [[1, 1, 0], [1, 0, 0], [1, 1, 0], [1, 0, 0]];
    barcodesDict["2,2"].neighbours[1] = [1, 0, 0];
    barcodesDict["2,1"].neighbours[1] = [1, 0, 0];
    barcodesDict["2,0"].neighbours[1] = [1, 0, 0];
    barcodesDict["0,2"].neighbours[3] = [1, 0, 0];
    barcodesDict["0,1"].neighbours[3] = [1, 0, 0];
    barcodesDict["0,0"].neighbours[3] = [1, 0, 0];
    var bidirectionDirection = 0;
    var liftstate = 0;
    var sanityTest = validateBidirectionalMovementBetween2Coordinates(chargerCoordinate, entryCoordinate, bidirectionDirection, liftstate, barcodesDict);
    expect(sanityTest).toEqual(true);
  });
  test("if bi-directional movement if strict bidirectional movement is not possible from charger coordinate to entry exists", () => {
    var barcodesDict = makeState(singleFloorVanilla, 1).normalizedMap.entities.barcode;
    const chargerCoordinate = "1,2";
    const entryCoordinate = "1,1";
    barcodesDict["1,2"].neighbours = [[1, 1, 0], [1, 0, 0], [0, 0, 0], [1, 0, 0]];
    barcodesDict["1,0"].neighbours = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 0, 0]];
    barcodesDict["1,1"].neighbours = [[1, 1, 0], [1, 0, 0], [1, 1, 0], [1, 0, 0]];
    barcodesDict["2,2"].neighbours[1] = [1, 1, 0];
    barcodesDict["2,1"].neighbours[1] = [1, 0, 0];
    barcodesDict["2,0"].neighbours[1] = [1, 0, 0];
    barcodesDict["0,2"].neighbours[3] = [1, 0, 0];
    barcodesDict["0,1"].neighbours[3] = [1, 0, 0];
    barcodesDict["0,0"].neighbours[3] = [1, 0, 0];
    var bidirectionDirection = 0;
    var liftstate = 0;
    var sanityTest = validateBidirectionalMovementBetween2Coordinates(chargerCoordinate, entryCoordinate, bidirectionDirection, liftstate, barcodesDict);
    expect(sanityTest).toEqual(false);
  });
  test("if bi-directional movement if strict bidirectional movement is possible from charger coordinate to entry exists , but in different direction", () => {
    var barcodesDict = makeState(singleFloorVanilla, 1).normalizedMap.entities.barcode;
    const chargerCoordinate = "1,2";
    const entryCoordinate = "1,1";
    barcodesDict["1,2"].neighbours = [[1, 1, 0], [1, 0, 0], [0, 0, 0], [1, 0, 0]];
    barcodesDict["1,0"].neighbours = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 0, 0]];
    barcodesDict["1,1"].neighbours = [[1, 1, 0], [1, 0, 0], [1, 1, 0], [1, 0, 0]];
    barcodesDict["2,2"].neighbours[1] = [1, 0, 0];
    barcodesDict["2,1"].neighbours[1] = [1, 0, 0];
    barcodesDict["2,0"].neighbours[1] = [1, 0, 0];
    barcodesDict["0,2"].neighbours[3] = [1, 0, 0];
    barcodesDict["0,1"].neighbours[3] = [1, 0, 0];
    barcodesDict["0,0"].neighbours[3] = [1, 0, 0];
    var bidirectionDirection = 1;
    var liftstate = 0;
    var sanityTest = validateBidirectionalMovementBetween2Coordinates(chargerCoordinate, entryCoordinate, bidirectionDirection, liftstate, barcodesDict);
    expect(sanityTest).toEqual(false);
  });
  test("if bi-directional movement if strict bidirectional movement is possible from charger coordinate to entry exists ,in liftstate 1", () => {
    var barcodesDict = makeState(singleFloorVanilla, 1).normalizedMap.entities.barcode;
    const chargerCoordinate = "1,2";
    const entryCoordinate = "1,1";
    barcodesDict["1,2"].neighbours = [[1, 1, 1], [1, 0, 0], [0, 0, 0], [1, 0, 0]];
    barcodesDict["1,0"].neighbours = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 0, 0]];
    barcodesDict["1,1"].neighbours = [[1, 1, 0], [1, 0, 0], [1, 1, 1], [1, 0, 0]];
    barcodesDict["2,2"].neighbours[1] = [1, 0, 0];
    barcodesDict["2,1"].neighbours[1] = [1, 0, 0];
    barcodesDict["2,0"].neighbours[1] = [1, 0, 0];
    barcodesDict["0,2"].neighbours[3] = [1, 0, 0];
    barcodesDict["0,1"].neighbours[3] = [1, 0, 0];
    barcodesDict["0,0"].neighbours[3] = [1, 0, 0];
    var bidirectionDirection = 0;
    var liftstate = 1;
    var sanityTest = validateBidirectionalMovementBetween2Coordinates(chargerCoordinate, entryCoordinate, bidirectionDirection, liftstate, barcodesDict);
    expect(sanityTest).toEqual(true);
  });
});


describe("validateChargerLayout", () => {
  // barcode
  // 3,1        2,1            1,1
  // 3,2        2,2            1,2
  // 3,3        2,3            1,3
  // 1,2 <- charger.
  test("if charger neighbour structure is valid", () => {
    var normalizedMap = makeState(singleFloorVanillaCharger, 1).normalizedMap.entities;
    var barcodesDict = normalizedMap.barcode;
    var charger = normalizedMap.charger[1];
    var sanityTest = ValidateChargerLayout(charger, barcodesDict);
    expect(sanityTest).toEqual({ "finalChargerSanityResult": true });
  });

  test("if rack movement is allowed to charger coordinate", () => {
    var normalizedMap = makeState(singleFloorVanillaCharger, 1).normalizedMap.entities;
    var barcodesDict = normalizedMap.barcode;
    var charger = normalizedMap.charger[1];
    barcodesDict["2,2"].neighbours[2] = [1, 1, 1];
    var sanityTest = ValidateChargerLayout(charger, barcodesDict);
    expect(sanityTest).toEqual(
      {
        "finalChargerSanityResult": false,
        "isBidirectionalMovementValid": true,
        "isChargerCoordinateValid": { "IsValidChargerCoordinate": true },
        "isRackMovementAllowedToChargerCoordinate":
        {
          "invalidNeigbbours": [],
          "isRackMovementAllowed": false
        },
        "isRackMovementAllowedToReinitCooridnate":
        {
          "invalidNeigbbours":
            [{ "coordinate": "2,2", "direction": 0 }],
          "isRackMovementAllowed": true
        }
      });
  });
  test("if  movement is allowed to multiple coordinates from charger coordinate", () => {
    var normalizedMap = makeState(singleFloorVanillaCharger, 1).normalizedMap.entities;
    var barcodesDict = normalizedMap.barcode;
    var charger = normalizedMap.charger[1];
    barcodesDict["2,3"].neighbours = [[1, 1, 0], [1, 1, 0], [0, 0, 0], [1, 1, 0]];
    barcodesDict["2,3"].adjacency = [[500, 500], [1, 3], null, [3, 3]];

    var sanityTest = ValidateChargerLayout(charger, barcodesDict);
    expect(sanityTest).toEqual(
      {
        "finalChargerSanityResult": false,
        "isBidirectionalMovementValid": true,
        "isChargerCoordinateValid":
        {
          "IsValidChargerCoordinate": false,
          "invalidNeigbboursReachablefromCharger": ["500,500", "1,3", "3,3"]
        },
        "isRackMovementAllowedToChargerCoordinate": { "invalidNeigbbours": [], "isRackMovementAllowed": false },
        "isRackMovementAllowedToReinitCooridnate": { "invalidNeigbbours": [], "isRackMovementAllowed": false }
      });
  });
  test("if  movement is allowed from multiple coordinates to charger coordinate", () => {
    var normalizedMap = makeState(singleFloorVanillaCharger, 1).normalizedMap.entities;
    var barcodesDict = normalizedMap.barcode;
    var charger = normalizedMap.charger[1];
    barcodesDict["3,3"].neighbours[1] = [1, 1, 0];
    barcodesDict["1,3"].neighbours[3] = [1, 1, 0];
    var sanityTest = ValidateChargerLayout(charger, barcodesDict);
    expect(sanityTest).toEqual(
      {
        "finalChargerSanityResult": false,
        "isBidirectionalMovementValid": true,
        "isChargerCoordinateValid":
        {
          "IsValidChargerCoordinate": false, "invalidNeigbboursThatAllowAccess": ["500,500", "1,3"]
        },
        "isRackMovementAllowedToChargerCoordinate": { "invalidNeigbbours": [], "isRackMovementAllowed": false },
        "isRackMovementAllowedToReinitCooridnate": { "invalidNeigbbours": [], "isRackMovementAllowed": false }
      }
    );
  });
});

describe("validateChargersLayout", () => {
  // barcode
  // 3,1        2,1            1,1
  // 3,2        2,2            1,2
  // 3,3        2,3            1,3
  // 1,2 <- charger.
  test("if charger neighbour structure is valid", () => {
    var normalizedMap = makeState(singleFloorVanillaCharger, 1).normalizedMap.entities;
    var barcodesDict = normalizedMap.barcode;
    var chargers = normalizedMap.charger;
    var sanityTest = validateChargersLayout(chargers, barcodesDict);
    expect(sanityTest).toEqual({ "finalResult": true });
  });

  test("if rack movement is allowed to charger coordinate", () => {
    var normalizedMap = makeState(singleFloorVanillaCharger, 1).normalizedMap.entities;
    var barcodesDict = normalizedMap.barcode;
    var chargers = normalizedMap.charger;
    barcodesDict["2,2"].neighbours[2] = [1, 1, 1];
    var sanityTest = validateChargersLayout(chargers, barcodesDict);
    expect(sanityTest).toEqual(
      {
        "finalResult": false,
        "invalidChargerData":
          [{
            "charger": 1,
            "finalChargerSanityResultData":
            {
              "finalChargerSanityResult": false,
              "isBidirectionalMovementValid": true,
              "isChargerCoordinateValid":
                { "IsValidChargerCoordinate": true },
              "isRackMovementAllowedToChargerCoordinate":
                { "invalidNeigbbours": [], "isRackMovementAllowed": false },
              "isRackMovementAllowedToReinitCooridnate":
              {
                "invalidNeigbbours": [{ "coordinate": "2,2", "direction": 0 }],
                "isRackMovementAllowed": true
              }
            }
          }]
      }
    );
  });
});