import { isValidCoordinateKey,getNeighbourTiles,coordinateKeyToTupleOfIntegers, tupleOfIntegersToCoordinateKey } from "./util";
// import barcode from "../reducers/barcode";

export const mapSanityResult = (barcodesDict) => {
  var sanity = [];
  var neighbourStructureConsistency = checkNeighbourStructureConsistency(barcodesDict);
  var ifAisleToStorageAndVisavis = checkIfAisleToStorageAndVisavis(barcodesDict);
  var deadGridPositions = checkDeadGridPositions(barcodesDict);
  if(neighbourStructureConsistency.length != 0){
    sanity.push({"check_neighbour_structure_consistency" : neighbourStructureConsistency});
  }
  if(ifAisleToStorageAndVisavis.length != 0){
    sanity.push({"check_if_aisle_to_storage_and_visavis" : ifAisleToStorageAndVisavis});
  }
  if(deadGridPositions != 0){
    sanity.push({"is_dead_grid_positions" : deadGridPositions});
  }else if(sanity.length == 0){
    sanity.push({"finalResult":true});
  }
  return sanity;
};

//"If the neighbour does not exist (E), bot movement (B) should not be allowed."
// "If bot movement is not allowed, rack movement (R) should not be allowed."
// "checks if neighbours according to the neighbour structure actually exists in gridinfo.
export const checkNeighbourStructureConsistency = (barcodesDict) => {
  var wrongCoordinate = [];
  for (var coordinateKey in barcodesDict) {
    var e0, b0, r0,e1, b1, r1,e2, b2, r2,e3, b3, r3;
    [[e0, b0, r0], [e1, b1, r1], [e2, b2, r2], [e3, b3, r3]] = barcodesDict[coordinateKey].neighbours;
    var invalidMovement =
      (e0 == 0 && b0 + r0 > 0) || (e1 == 0 && b1 + r1 > 0) || (e2 == 0 && b2 + r2 > 0) || (e3 == 0 && b3 + r3 > 0) 
          || (b0 == 0 &&  r0 > 0) || (b1 == 0 &&  r1 > 0) || (b2 == 0 &&  r2 > 0) || (b3 == 0 && r3 > 0);
    var nonExistentNeighbour = getNonExistentNeighbour(barcodesDict[coordinateKey].neighbours,coordinateKey,barcodesDict);
    if ((invalidMovement || nonExistentNeighbour) == true) {
      wrongCoordinate.push(coordinateKey);
    };
  };
  return wrongCoordinate;
};

export const getNonExistentNeighbour = (neighbours,coordinateKey,barcodesDict)=>{
  var nonExistentNeighbour = false;
  for(var neighbour_stucture in neighbours){
    var inDirNeigh = neighbours[neighbour_stucture];
    if(inDirNeigh[0] == 0){
      nonExistentNeighbour = nonExistentNeighbour || false;
    }else{
      nonExistentNeighbour = nonExistentNeighbour || (getNeighbourInDirection(coordinateKey,neighbour_stucture,barcodesDict)==null);
    }
  };
  return nonExistentNeighbour;
};

export const getNeighbourInDirection = (coordinateKey,direction,barcodesDict) =>{
  if (isValidCoordinateKey(coordinateKey)){
    var coordinate;
    if(barcodesDict[coordinateKey].adjacency == undefined){
      var transPortInfoInDir = barcodesDict[coordinateKey].neighbours[direction];
      if(transPortInfoInDir == [0,0,0]){
        return null;
      }else{
        coordinate = getNeighbourTiles(coordinateKey)[direction];
      }
    }else{
      coordinate = barcodesDict[coordinateKey].adjacency[direction];
    }
    if ( barcodesDict[coordinate] != undefined){
      return coordinate;
    }else{
      return null;
    }
  }else{
    return null;
  }
};


// "for a given storable , if there is an aisle present in one of its neighbours , we have to check the following"
// "the rack movement must be allowed from aisle to storable and from storable to aisle."
//" If not, then add both to invalid data in the form {coordinate, direction in which movement is inconsistent}"
export const checkIfAisleToStorageAndVisavis = (barcodesDict) =>{
  var finalInvalidDataAcc = [];
  for (var coordinateKey in barcodesDict){
    if(barcodesDict[coordinateKey].store_status == 1){
      var neighbourCoordinates = getAllExistingNeighbours(coordinateKey,barcodesDict);
      for(var neighbour in neighbourCoordinates ){
        if(barcodesDict[neighbourCoordinates[neighbour]] != undefined && barcodesDict[neighbourCoordinates[neighbour]].store_status == 1){
          // finalInvalidDataAcc.push([]);
        }else{
          var result = getToAndFroRackMovementMismatch(coordinateKey,neighbourCoordinates[neighbour],barcodesDict);
          if(result != undefined){
            finalInvalidDataAcc.push(result);
          };
        }
      };
    };
  };
  return finalInvalidDataAcc;
};

export const getAllExistingNeighbours = (coordinateKey,barcodesDict) => {
  var neighbours = getNeighbourTiles(coordinateKey);
  var ExistingNeighbour = [];
  for(var i=0; i<4; i++){
    if(neighbours[i] != null && barcodesDict[neighbours[i]] != undefined){
      ExistingNeighbour.push(neighbours[i]);
    };
  }
  return ExistingNeighbour;
};

export const getToAndFroRackMovementMismatch = (coordinateKey1,coordinateKey2,barcodesDict) => {
  var coor1NeighbourStructure = barcodesDict[coordinateKey1].neighbours;
  var coor2NeighbourStructure = barcodesDict[coordinateKey2].neighbours;
  var Coor1ToCoor2Dir = getDirection(coordinateKey2,coordinateKey1,barcodesDict);
  var Coor2ToCoor1Dir = (Coor1ToCoor2Dir + 2) % 4;
  var rack1 = coor1NeighbourStructure[Coor1ToCoor2Dir][2];
  var rack2 = coor2NeighbourStructure[Coor2ToCoor1Dir][2];
  if(rack1 != rack2){
    return [{coordinateKey1,Coor1ToCoor2Dir},{coordinateKey2,Coor2ToCoor1Dir}];
  };
};

export const getDirection = (destinationCoordinateKey,sourceCoordinateKey,barcodesDict) => {
  if(barcodesDict[sourceCoordinateKey].adjacency == undefined){
    return getDirectionUsingCoordinate(destinationCoordinateKey,sourceCoordinateKey);
  }else{
    if(barcodesDict[sourceCoordinateKey].adjacency.indexOf(destinationCoordinateKey) == -1){
      return getDirectionUsingCoordinate(destinationCoordinateKey,sourceCoordinateKey);
    }else{
      return (barcodesDict[sourceCoordinateKey].adjacency.indexOf(destinationCoordinateKey) );
    }
  }
};

export const getDirectionUsingCoordinate =(destinationCoordinateKey,sourceCoordinateKey) =>{
  var destination = coordinateKeyToTupleOfIntegers(destinationCoordinateKey);
  var source = coordinateKeyToTupleOfIntegers(sourceCoordinateKey);
  if(destination[1] < source[1]){
    return 0;
  }else if(destination[0] < source[0]){
    return 1;
  }else if(destination[1] > source[1]){
    return 2;
  }else {
    return 3;
  }
};

// if movement is not allowed from the coordinate , then movement must be disallowed from all of its neighbours.
export const checkDeadGridPositions = (barcodesDict) => {
  var wrongCoordinates = [];

  for (var coordinateKey in barcodesDict) {
    var neighbourListWithLiftUp = getAccessibleNeighboursInAllDirectionsStatic(coordinateKey, "up", barcodesDict);
    var neighbourListWithLiftDown = getAccessibleNeighboursInAllDirectionsStatic(coordinateKey, "down", barcodesDict);
    var isDeadGridDown = neighbourListWithLiftDown.length == 0;
    var isDeadGridUp = neighbourListWithLiftUp.length == 0;
    var isDeadGrid = isDeadGridDown || isDeadGridUp;
    var allFourNeighbours = getAllFourNeighbours(coordinateKey, barcodesDict);
    var validNeighbours = [];
    for(var neigh in allFourNeighbours){
      if(neigh != null && isValidCoordinateKey(allFourNeighbours[neigh])){
        validNeighbours.push(allFourNeighbours[neigh]);
      }
    };
    var isAllDirectionBlocked = true;
    for(var neighbourCordDir in validNeighbours){
      var neighbourCord = validNeighbours[neighbourCordDir];
      try{
        var neighbourToCoordDir = getDirection(coordinateKey, neighbourCord, barcodesDict);
        var oppNeighbourToCoordDir = (neighbourToCoordDir + 2) % 4;
        var b, d, u;
        [b, d, u] = barcodesDict[neighbourCord].neighbours[neighbourToCoordDir];
        if(isDeadGridDown == true && d == 1 && isDeadGrid == true && b == 1 ){
          wrongCoordinates.push([{coordinateKey, oppNeighbourToCoordDir},{neighbourCord, neighbourToCoordDir}]);
        }else if(isDeadGridDown == false && isDeadGridUp == true && u == 1 && isDeadGrid == true && b == 1){
          wrongCoordinates.push([{coordinateKey, oppNeighbourToCoordDir},{neighbourCord, neighbourToCoordDir}]);
        };
      }catch(e){
        isAllDirectionBlocked;
      };
    };
  };
  return wrongCoordinates;
};

export const getAccessibleNeighboursInAllDirectionsStatic = (coordinateKey, liftState, barcodesDict) => {
  var direction = [0,1,2,3];
  var result = [];
  for(var dir in direction) {
    var nthDirectionNeighbour = barcodesDict[coordinateKey].neighbours[dir];
    if(nthDirectionNeighbour[0] + nthDirectionNeighbour[1] == 2 && liftState == "down"){
      if(barcodesDict[coordinateKey].adjacency == undefined){
        result.push(getExistingNeighbourInDirection(coordinateKey, dir));
      }else if(barcodesDict[coordinateKey].adjacency[direction] != null){
        result.push(barcodesDict[coordinateKey].adjacency[direction]);
      }
    }else if(nthDirectionNeighbour[0] + nthDirectionNeighbour[1] + nthDirectionNeighbour[2] == 3){
      if(barcodesDict[coordinateKey].adjacency == undefined){
        result.push(getExistingNeighbourInDirection(coordinateKey, dir));
      }else if(barcodesDict[coordinateKey].adjacency[direction] != null){
        result.push(barcodesDict[coordinateKey].adjacency[direction]);
      }
    }else{
      result;
    }
  };
  return result;
};

export const getAllFourNeighbours = (coordinateKey, barcodesDict) =>{
  var direction = [0,1,2,3];
  var result = [];
  for(var dir in direction) {
    result.push(getNeighbourInDirection(coordinateKey, dir, barcodesDict));
  }
  return result;
};

export const getExistingNeighbourInDirection = (coordinateKey, direction) => {
  var x,y;
  [x, y] = coordinateKeyToTupleOfIntegers(coordinateKey);
  if(direction == 0){
    return tupleOfIntegersToCoordinateKey([x, y-1]);
  }else if(direction == 1){
    return tupleOfIntegersToCoordinateKey([x-1, y]);
  }else if(direction == 2){
    return tupleOfIntegersToCoordinateKey([x,y+1]);
  }else {
    return tupleOfIntegersToCoordinateKey([x+1,y]);
  }
};
