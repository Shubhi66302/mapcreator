import { createSelector } from "reselect";
export const getCurrentFloorBarcodeIds = state =>
  state.normalizedMap.entities.floor[state.currentFloor].map_values;
export const getBarcodes = state => state.normalizedMap.entities.barcode || {};
export const getBarcode = (state, { tileId }) =>
  state.normalizedMap.entities.barcode[tileId];
export const getCurrentFloorBarcodes = createSelector(
  getCurrentFloorBarcodeIds,
  getBarcodes,
  (barcodeKeys, barcodes) => {
    var currentFloorBarcodes = {};
    barcodeKeys.forEach(barcodeKey => {
      currentFloorBarcodes[barcodeKey] = barcodes[barcodeKey];
    });
    return currentFloorBarcodes;
  }
);

export const getBarcodeSize = createSelector(
  getBarcode,
  barcodeInfo => {
    var barcodeSizeInfo = barcodeInfo.size_info;
    return [
      barcodeSizeInfo[0],
      barcodeSizeInfo[1],
      barcodeSizeInfo[2],
      barcodeSizeInfo[3]
    ];
  }
);

// since barcodes =/= coordinate sometimes
export const coordinateKeyToBarcodeSelector = createSelector(
  getBarcode,
  barcode => barcode.barcode
);

// assumed that there is one-to-one relationship b/w barcode string and coordinate on a floor
export const currentFloorBarcodeToCoordinateMap = createSelector(
  getCurrentFloorBarcodeIds,
  getBarcodes,
  (tileIds, barcodes) => {
    var ret = {};
    for (var tileId of tileIds) {
      const barcodeString = barcodes[tileId].barcode;
      if (ret[barcodeString]) {
        throw Error(
          `duplicate barcodes on current floor: ${barcodeString}, tile ids ${
            ret[barcodeString]
          }, ${tileId}`
        );
      }
      ret[barcodeString] = tileId;
    }
    return ret;
  }
);

export const currentFloorBarcodeToCoordinateKeySelector = createSelector(
  currentFloorBarcodeToCoordinateMap,
  (_state, { barcode }) => barcode,
  (barcodeCoordinateMap, barcode) => barcodeCoordinateMap[barcode]
);

export const getCurrentFloorBarcodesList = createSelector(
  getCurrentFloorBarcodeIds,
  getBarcodes,
  (currentFloorBarcodeIds, barcodesDict) =>
    currentFloorBarcodeIds.map(coordinate => barcodesDict[coordinate])
);
