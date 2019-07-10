import { createSelector } from "reselect";
export const getCurrentFloorBarcodeIds = state => state.normalizedMap.entities.floor[state.currentFloor].map_values;
export const getBarcodes = state => state.normalizedMap.entities.barcode || {};
export const getBarcode = (state, { tileId }) => state.normalizedMap.entities.barcode[tileId];
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
  (barcodeInfo) => {
    var barcodeSizeInfo = barcodeInfo.size_info;
    return [
      barcodeSizeInfo[0],
      barcodeSizeInfo[1],
      barcodeSizeInfo[2],
      barcodeSizeInfo[3]
    ];
  }
);