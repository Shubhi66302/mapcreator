
export const validateNeighbours = (barcodesDict) => {
  var wrongCoordinate = [];
  for (var coordinateKey in barcodesDict) {
    var validate = true;
    for (var neighbourStucture in barcodesDict[coordinateKey].neighbours) {
      var neighbourInDir = barcodesDict[coordinateKey].neighbours[neighbourStucture];
      if (neighbourInDir[0] == 0) {
        if (neighbourInDir[1] == 0 && neighbourInDir[2] == 0) {
          validate = validate && true;
        }
        else {
          validate = validate && false;
        }
      };
    };
    if (validate == false) {
      wrongCoordinate.push(coordinateKey);
    };
  };
  if (wrongCoordinate.length == 0){
    return {"finalResult" : true};
  }
  else{
    return {"finalResult" : false , "invalidCoordinateData" : wrongCoordinate};
  }
};
