import { getNeighbouringBarcodes, implicitBarcodeToCoordinate, getNeighboursThatAllowAccess } from "./util";
import { getDirection } from "../reducers/barcode/util";

export const validateChargersLayout = (chargerDict, barcodeDict) => {
  var invalidCharger = [];
  var finalChargerSanityResult = true;
  for (let [, charger] of Object.entries(chargerDict)) {
    var singleChargerResult = true;
    singleChargerResult = ValidateChargerLayout(charger, barcodeDict);
    finalChargerSanityResult = finalChargerSanityResult && singleChargerResult["finalChargerSanityResult"];
    if (finalChargerSanityResult == false) {
      invalidCharger.push({"charger" : charger.charger_id,"finalChargerSanityResultData" : singleChargerResult });
    }
  };
  if (invalidCharger.length == 0){
    return {"finalResult" : true};
  }
  else{
    return {"finalResult" : false , "invalidChargerData" : invalidCharger};
  }
};

export const ValidateChargerLayout = (charger, barcodeDict) => {
  const chargerCoordinate = charger.coordinate;
  var chargerEntryPointCoordinate = implicitBarcodeToCoordinate(charger.entry_point_location);
  var chargerReinitPointCoordinate = implicitBarcodeToCoordinate(charger.reinit_point_location);
  const isRackMovementAllowedToChargerCoordinate = checkIfRackMovementAllowedToCoordinateFromNeighbours(charger.coordinate, barcodeDict);
  const isRackMovementAllowedToReinitCooridnate = checkIfRackMovementAllowedToCoordinateFromNeighbours(chargerReinitPointCoordinate, barcodeDict);
  const isRackMovementNotAllowed = !isRackMovementAllowedToChargerCoordinate["isRackMovementAllowed"] && !isRackMovementAllowedToReinitCooridnate["isRackMovementAllowed"];
  const isChargerCoordinateValid = validateChargerCoordinate(chargerCoordinate, charger.charger_direction, barcodeDict);
  const isBidirectionalMovementValid = validateBidirectionalMovementBetween2Coordinates(chargerReinitPointCoordinate, chargerEntryPointCoordinate, charger.charger_direction, 0, barcodeDict);
  const finalChargerSanityResult = isRackMovementNotAllowed && isChargerCoordinateValid["IsValidChargerCoordinate"] && isBidirectionalMovementValid;
  
  if (finalChargerSanityResult == true){
    return {"finalChargerSanityResult" : true};
  }
  else{
    var finalSanityResultJson =
    {
      "finalChargerSanityResult" : finalChargerSanityResult,
      "isRackMovementAllowedToChargerCoordinate": isRackMovementAllowedToChargerCoordinate,
      "isRackMovementAllowedToReinitCooridnate": isRackMovementAllowedToReinitCooridnate,
      "isChargerCoordinateValid": isChargerCoordinateValid,
      "isBidirectionalMovementValid": isBidirectionalMovementValid
    };
    return finalSanityResultJson;
  }
};

export const checkIfRackMovementAllowedToCoordinateFromNeighbours = (chargerGridCoordinate, barcodeDict) => {
  // get exisiting reachable neighbours for the current coordinates. 
  const neighbours = getNeighbouringBarcodes(chargerGridCoordinate, barcodeDict);
  var solutionDict = {};
  solutionDict["isRackMovementAllowed"] = false;
  solutionDict["invalidNeigbbours"] = [];
  
  
  const neighboursLen = (neighbours === null)? 0 : neighbours.length;

  for (var i = 0; i < neighboursLen; i++) {
    var neighbour = neighbours[i];
    if (neighbour != null) {
      const coordinateToNeighbourDirection = getDirection(chargerGridCoordinate, neighbour.coordinate, barcodeDict);
      const oppCoordinateToNeighbourDirection = (coordinateToNeighbourDirection + 2) % 4;
      const neighbourNs = neighbour.neighbours;
      const neighboutToChargerNs = neighbourNs[oppCoordinateToNeighbourDirection];
      const neighboutToChargerRackMovement = neighboutToChargerNs[2];
      if (neighboutToChargerRackMovement == 1) {
        solutionDict["isRackMovementAllowed"] = solutionDict["isRackMovementAllowed"] || true;
        solutionDict["invalidNeigbbours"].push({ "coordinate": neighbour.coordinate, "direction": i });
      }
    }
  };
  return solutionDict;
};

export const validateChargerCoordinate = (chargerGridCoordinate, chargerDirection, barcodeDict) => {
  var neighbours = getNeighbouringBarcodes(chargerGridCoordinate, barcodeDict);
  neighbours = neighbours.filter((neighbour) => { return neighbour != null; });
  var solutionDict = {};
  solutionDict["IsValidChargerCoordinate"] = true;
  if (neighbours.length != 1) {
    solutionDict["IsValidChargerCoordinate"] = false;
    solutionDict["invalidNeigbboursReachablefromCharger"] = neighbours.map((n) => { return n.coordinate; });
    return solutionDict;
  }
  else {
    var neighboursThatAllowAccess = getNeighboursThatAllowAccess(chargerGridCoordinate, barcodeDict);
    neighboursThatAllowAccess = neighboursThatAllowAccess.filter((neighbour) => { return neighbour != null; });
    if (neighboursThatAllowAccess.length != 1) {
      solutionDict["IsValidChargerCoordinate"] = false;
      solutionDict["invalidNeigbboursThatAllowAccess"] = neighboursThatAllowAccess.map((n) => { return n.coordinate; });
      return solutionDict;
    }
    else {
      var neighbour = neighboursThatAllowAccess[0];
      const coordinateToNeighbourDirection = getDirection(chargerGridCoordinate, neighbour.coordinate, barcodeDict);
      if (coordinateToNeighbourDirection == chargerDirection) {
        return solutionDict;
      }
      else {
        solutionDict["IsValidChargerCoordinate"] = false;
        solutionDict["invalidNeigbboursThatAllowAccessInWrongDirection"] = neighboursThatAllowAccess.map((n) => { return n.coordinate; });
        return solutionDict;
      }
    }
  }
};

export const validateBidirectionalMovementBetween2Coordinates = (sourceCoordinate, destinationCoordinate, bidirectionDirection, liftState, barcodesDict) => {
  // currently the default charger created through map creator has entry_barcode and reinit_barcode same .
  // this is an exception case and it doesn't comply with the function's definition.
  if (sourceCoordinate == destinationCoordinate) {
    return true;
  }
  var neighbours = getNeighbouringBarcodes(sourceCoordinate, barcodesDict);
  var neighboursThatAllowAccess = getNeighboursThatAllowAccess(sourceCoordinate, barcodesDict);
  neighbours = neighbours.filter((neighbour) => { return neighbour != null; });
  neighboursThatAllowAccess = neighboursThatAllowAccess.filter((neighbour) => { return neighbour != null; });
  if (neighbours.length != 1) {
    return false;
  }
  else {
    var neighbourInDirection = neighbours[bidirectionDirection];
    var neighbourInDirection2 = neighboursThatAllowAccess[bidirectionDirection];
    if (neighbourInDirection == null) {
      return false;
    }
    else {
      if (neighboursThatAllowAccess.length != 1) {
        return false;
      }
      else {
        if (neighbourInDirection.coordinate == destinationCoordinate & neighbourInDirection.coordinate == neighbourInDirection2.coordinate) {

          return neighbourInDirection.neighbours[(bidirectionDirection + 2) % 4][liftState + 1] == 1;
        }
        else {
          return false;
        }
      }
    }
  }
};
