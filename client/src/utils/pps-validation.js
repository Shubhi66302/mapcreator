import {
  implicitCoordinateKeyToBarcode,
  isValidCoordinateKey,
  getNeighboursThatAllowAccessWithLiftState,
  getNeighbouringBarcodesWithNbFilter,
  implicitBarcodeToCoordinate
} from "utils/util";

export const validateAllPpses = (
  ppsObjList,
  barcodesDict
) => {
  let singlePpsResult;
  let finalResult = true;
  var invalidPpses = [];
  for (let [, ppsObj] of Object.entries(ppsObjList)) {
    singlePpsResult = validatePpsQueue(barcodesDict,ppsObj);
    finalResult =  finalResult && singlePpsResult["finalPpsSanityResult"];
    if (finalResult == false) {
      invalidPpses.push({"PpsId" : ppsObj.pps_id, "finalPpsSanityResultData" : singlePpsResult});
    }
  }
  if (invalidPpses.length == 0)
    return {"finalResult" : true};
  else
    return {"finalResult" : false , "PpsSanityData" : invalidPpses};
};

export const validatePpsQueue = (
  barcodesDict,
  ppsObj
) => {
  const { coordinate } = ppsObj;
  const { location } = ppsObj;
  const { queue_barcodes } = ppsObj;
  const { pick_direction } = ppsObj;
  const { type } = ppsObj;
  let isValidCoordinate;
  let isValidlocation;
  let isValidQueueBarcode;
  let isValidType;
  let isValidPpsDirection;
  let isEntryAndExitCorrect;
  let result = true;
  var finalSanityResultJson;

  if (queue_barcodes.length == 0)
  {
    finalSanityResultJson =
    {
      "finalPpsSanityResult" : false,
      "isValidQueue" : false
    };
    return finalSanityResultJson;
  }
    
  if (!isValidCoordinateKey(coordinate)) {
    isValidCoordinate = coordinate;
    result = false;
  }
  const barcode = implicitCoordinateKeyToBarcode(coordinate);
  if (!(location == barcode)) {
    isValidlocation = coordinate;
    result = false;
  }

  for (var i = 0; i < queue_barcodes.length; i++) {
    const curBarcode = barcodesDict[implicitBarcodeToCoordinate(queue_barcodes[i])];
    if (!curBarcode) {
      isValidQueueBarcode = isValidQueueBarcode + "," + curBarcode ;
      result = false;
    }
  }

  const allowed_type = ["ppp_manual", "ara", "manual", "ud_put_manual"];
  for (i = 0; i < allowed_type.length; i++) {
    if (type.localeCompare(allowed_type[i])) 
      break;
    if (i == allowed_type.length - 1)
    {
      isValidType = type;
      result = false;
    }
  }

  // if (type == "ppp_manual") // Ensure bidirectional or Unidirectional Queue is valid
  //     result7 = IsQueueBidirectional(ppsId, queue_barcodes, barcodesDict); //validate_bidirectional_path
  // else
  //     result7 = IsQueueUnidirectional(ppsId, queue_barcodes, barcodesDict); //validate_unidirectional_path

  if (!IsValidPpsDirection(coordinate, pick_direction, barcodesDict, queue_barcodes))
  {
    isValidPpsDirection = pick_direction;
    result = false;
  }

  if (!IsEntryAndExitCorrect(coordinate, queue_barcodes, barcodesDict))
  {
    isEntryAndExitCorrect = coordinate;
    result = false;
  }

  if (!result)
  {
    finalSanityResultJson =
    {
      "finalPpsSanityResult" : false,
      "isValidCoordinate" : isValidCoordinate,
      "isValidlocation" : isValidlocation,
      "isValidQueueBarcode": isValidQueueBarcode,
      "isValidType": isValidType,
      "isValidPpsDirection": isValidPpsDirection,
      "isEntryAndExitCorrect": isEntryAndExitCorrect
    };
    return finalSanityResultJson;
  }
  else
    return {"finalPpsSanityResult" : true};
};

// export const IsQueueBidirectional = (
//   queue_barcodes,
//   barcodesDict,
// ) => {
//   const size = queue_barcodes.length;
//   const startBarcode = queue_barcodes[0];
//   const endBarcode = queue_barcodes[size - 1];
//   let queueCoordinate;
//   let queueBarcode;

//   for (let i = 0; i < queue_barcodes.length; i++) {
//     queueBarcode = queue_barcodes[i];
//     queueCoordinate = implicitBarcodeToCoordinate(queueBarcode);
//     const neighbours = getNeighbouringBarcodes(
//       queueCoordinate,
//       barcodesDict,
//     );
//     if ((queueBarcode != startBarcode) && (queueBarcode != endBarcode)) {
//         for (let j = 0; i < neighbours.length; i++)
//         {
//             if (neighbours[i] != null)
//               count++;
//         }
//         if (count != 2)
//           return false;
//       }
//   }
//   return true;
// };

// export const IsQueueUnidirectional = (
//   queue_barcodes,
//   barcodesDict,
// ) => {
//   const size = queue_barcodes.length;
//   const startBarcode = queue_barcodes[0];
//   const endBarcode = queue_barcodes[size - 1];
//   let queueCoordinate;
//   let queueBarcode;
//   let count;
//   for (let i = 0; i < queue_barcodes.length; i++) {
//     queueBarcode = queue_barcodes[i];
//     count = 0;
//     queueCoordinate = implicitBarcodeToCoordinate(queueBarcode);
//     const neighbours = getNeighbouringBarcodes(
//       queueCoordinate,
//       barcodesDict,
//     );
//     if ((queueBarcode != startBarcode) && (queueBarcode != endBarcode)) {
//       for (let j = 0; i < neighbours.length; i++)
//       {
//           if (neighbours[i] != null)
//             count++;
//       }
//       if (count != 1)
//         return false;
//     }
//   }
//   return true;
// };

export const IsValidPpsDirection = (
  coordinate,
  pick_direction,
  barcodesDict,
  queue_barcodes
) => {
  let direction;
  let oppositeDirection;

  const validDirections = [0, 1, 2, 3];
  for (let i = 0; i < validDirections.length; i++) {
    if (pick_direction == validDirections[i])
      break;
    if (i == validDirections.length - 1) // end of array reached and no match yet, hence throw error
      return false;
  }
  let coordinateBeforePps = getCoordinateBeforePps(coordinate, queue_barcodes);
  let filters = [ [0, 0, 0], [1, 0, 0], [1, 1, 0] ];
  const neighbours = getNeighbouringBarcodesWithNbFilter(
    coordinateBeforePps,
    barcodesDict,
    filters
  );
  if(neighbours != null){
    for (let i = 0; i < neighbours.length; i++) {
      if (neighbours[i] != null)
        direction = i;
    }
  }
  oppositeDirection = getOppositeDirection(direction);

  if ((pick_direction == direction) || (pick_direction == oppositeDirection))
    return false;
  else
    return true;
};

export const IsEntryAndExitCorrect = (
  coordinate,
  queue_barcodes,
  barcodesDict,
) => {
  let result_entry = false;
  let result_exit = false;
  var exit = 0;
  let i = 0;
  let filters = [ [0, 0, 0], [1, 0, 0], [1, 1, 0] ];
  let adjNeighbour;

  const neighbours = getNeighbouringBarcodesWithNbFilter(
    coordinate,
    barcodesDict,
    filters
  );

  for (i = 0; i < neighbours.length; i++) {
    if (neighbours[i] != null)
    { 
      exit++;
    }
  }

  adjNeighbour = getNeighboursThatAllowAccessWithLiftState(
    coordinate,
    barcodesDict,
    1
  );
  adjNeighbour = adjNeighbour.filter((neighbour) => { return neighbour != null; });

  if (adjNeighbour.length != 1)
    result_entry = false;
  else
    result_entry = true;
  
  if (exit == 1)
    result_exit = true;
  else
    result_exit = false;

  return result_exit && result_entry;
};

export const getOppositeDirection = (  
  direction
) => {
  return Math.abs((direction-2) % 4);
};

export const getCoordinateBeforePps = (
  coordinate,
  queue_barcodes
) => {
  let coordinateBeforePps;
  let tempQueueCoordinate;
  for (let i = 0; i < queue_barcodes.length; i++) {
    tempQueueCoordinate = implicitBarcodeToCoordinate(queue_barcodes[i]);
    if (coordinate == tempQueueCoordinate && i > 0) {
      coordinateBeforePps = implicitBarcodeToCoordinate(queue_barcodes[i - 1]);
      break;
    }
  }
  return coordinateBeforePps;
};