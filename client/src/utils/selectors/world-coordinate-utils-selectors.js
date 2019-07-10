import {getCurrentFloorBarcodes, getBarcodeSize} from "./barcode-selectors";
import * as constants from "../../constants";
import { createSelector } from "reselect";
import { getNeighbouringBarcodesIncludingDisconnected } from "../util";

var getNeighbourWithValidWorldCoord = (barcode, barcodes, coordinateToWorldCoorinateMapInitial) => {
  var neighbours = getNeighbouringBarcodesIncludingDisconnected(barcode, barcodes);
  for (var neighbourDir in neighbours) {
    var nBarcodeInfo = neighbours[neighbourDir];
    if (nBarcodeInfo != null) {
      var nBarcodeKey = nBarcodeInfo.coordinate;
      var distanceInfo = nBarcodeInfo.size_info;
      if (coordinateToWorldCoorinateMapInitial.hasOwnProperty(nBarcodeKey)) {
        var nWorldCoordinate = coordinateToWorldCoorinateMapInitial[nBarcodeKey];
        return {
          direction: neighbourDir,
          worldcoordinate: nWorldCoordinate,
          distanceInfo: distanceInfo
        };
      }
    }
  }
};

export const getWorldCoordUsingNeighbour = (distanceInfo, neighbourWithWorldCoordinate) => {
  switch (neighbourWithWorldCoordinate.direction){
    case "0":
      return {
        x: neighbourWithWorldCoordinate.worldcoordinate.x,
        y: neighbourWithWorldCoordinate.worldcoordinate.y + distanceInfo[0] + neighbourWithWorldCoordinate.distanceInfo[2]
      };
    case "1":
      return {
        x: neighbourWithWorldCoordinate.worldcoordinate.x - (distanceInfo[1] + neighbourWithWorldCoordinate.distanceInfo[3]),
        y: neighbourWithWorldCoordinate.worldcoordinate.y
      };
    case "2":
      return {
        x: neighbourWithWorldCoordinate.worldcoordinate.x,
        y: neighbourWithWorldCoordinate.worldcoordinate.y - (distanceInfo[2] + neighbourWithWorldCoordinate.distanceInfo[0])
      };
    case "3":
      return {
        x: neighbourWithWorldCoordinate.worldcoordinate.x + (neighbourWithWorldCoordinate.distanceInfo[1] + distanceInfo[3]),
        y: neighbourWithWorldCoordinate.worldcoordinate.y
      };
    default:{
      return {x: undefined, y: undefined};
    }
  }
};


export const getTileIdToWorldCoordMapFunc = barcodes => {
  var tileIdToWorldCoordinateMapInitial = {};
  const startBarcode = Object.keys(barcodes)[0];
  var worldCoordinate = {x: 0, y: 0};
  tileIdToWorldCoordinateMapInitial[startBarcode] = worldCoordinate;
  const totalBarcodes = Object.keys(barcodes).length;
  var totalBarcodesWithDefinedWorldCoord = 1;
  while(totalBarcodesWithDefinedWorldCoord < totalBarcodes){
    for (var barcode in barcodes) {
      if (barcodes.hasOwnProperty(barcode)) {
        if (tileIdToWorldCoordinateMapInitial.hasOwnProperty(barcode)) {
          continue;
        };
        var barcodeInfoDict = barcodes[barcode];
        var distanceInfo = barcodeInfoDict.size_info;
        var neighbourWithWorldCoordinate =
          getNeighbourWithValidWorldCoord(barcode, barcodes, tileIdToWorldCoordinateMapInitial);
        if (neighbourWithWorldCoordinate != undefined){
          worldCoordinate = getWorldCoordUsingNeighbour(distanceInfo, neighbourWithWorldCoordinate);
          totalBarcodesWithDefinedWorldCoord = totalBarcodesWithDefinedWorldCoord + 1;
          tileIdToWorldCoordinateMapInitial[barcode] = worldCoordinate;
        };
      };
    };
  };
  return tileIdToWorldCoordinateMapInitial;
};

export const getTileIdToWorldCoordMap = createSelector(
  getCurrentFloorBarcodes,
  (barcodes) => {
    return getTileIdToWorldCoordMapFunc(barcodes);
  }
);

export var tileToWorldCoordinate = (tileId, tileIdToWorldCoordinateMap) => {
  var xCoord = (tileIdToWorldCoordinateMap[tileId].x);
  var yCoord = (tileIdToWorldCoordinateMap[tileId].y);
  return { x: xCoord, y: yCoord };
};


export var worldToTileCoordinate = createSelector(
  getTileIdToWorldCoordMap,
  (state, { x, y }) => [state, {x, y}],
  (tileIdToWorldCoordinateMap, [state, {x, y}]) => {
    for (var tileId in tileIdToWorldCoordinateMap) {
      // check if the property/key is defined in the object itself, not in parent
      if (tileIdToWorldCoordinateMap.hasOwnProperty(tileId)) {
        const barcodeSizeInfo = getBarcodeSize(state, {tileId});
        var worldXInPixel = tileIdToWorldCoordinateMap[tileId].x;
        var worldYInPixel = tileIdToWorldCoordinateMap[tileId].y;
        const defDistance = constants.DEFAULT_DISTANCE_BW_BARCODES;
        const topLeftPointX = worldXInPixel - barcodeSizeInfo[3] * (defDistance - constants.BARCODE_SPRITE_GAP) / defDistance;
        const topRightPointX = worldXInPixel + barcodeSizeInfo[1] * (defDistance - constants.BARCODE_SPRITE_GAP) / defDistance;
        const topLeftPointY = worldYInPixel - barcodeSizeInfo[0] * (defDistance - constants.BARCODE_SPRITE_GAP) / defDistance;
        const bottomLeftPointY = worldYInPixel + barcodeSizeInfo[2] * (defDistance - constants.BARCODE_SPRITE_GAP) / defDistance;
        if (
          (x <=  topRightPointX) && (x >=  topLeftPointX) &&
          (y <= bottomLeftPointY) &&  (y >=  topLeftPointY)
        ) {
          return tileId;
        }
      }
    };
    return undefined;
  }
);