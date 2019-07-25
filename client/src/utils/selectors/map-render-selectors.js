
// mainly selectors for map rendering
import {getBarcodeSize} from "./barcode-selectors";
import { createSelector } from "reselect";
import * as constants from "../../constants";
import {tileToWorldCoordinate} from "./world-coordinate-utils-selectors";

export const getTileSpriteScale = createSelector(
  getBarcodeSize,
  (barcodeSizeInfo) => {
    const barcodeSizeXInCADCoordinates = (barcodeSizeInfo[1] + barcodeSizeInfo[3]);
    const barcodeSizeYInCADCoordinates = (barcodeSizeInfo[0] + barcodeSizeInfo[2]);
    // Read tests to understand this calculation
    const xScale = (barcodeSizeXInCADCoordinates/1500) * (1500 - constants.BARCODE_SPRITE_GAP) / constants.TILE_SPRITE_WIDTH;
    const yScale = (barcodeSizeYInCADCoordinates/1500) * (1500 - constants.BARCODE_SPRITE_GAP) / constants.TILE_SPRITE_WIDTH;
    return {xScale, yScale};
  }
);

export const spriteRenderCoordinateSelector = createSelector(
  tileToWorldCoordinate,
  getTileSpriteScale,
  getBarcodeSize,
  (state_, {spriteIdx }) => ({ spriteIdx }),
  ({x: x, y: y }, {yScale}, barcodeSizeInfo, {spriteIdx }) => {
    var barcodeWidth = barcodeSizeInfo[1] + barcodeSizeInfo[3];
    const defaultDistance = constants.DEFAULT_DISTANCE_BW_BARCODES;
    // Width of barcode sprite
    barcodeWidth = barcodeWidth - (barcodeWidth * constants.BARCODE_SPRITE_GAP) / defaultDistance;
    var topDistance = barcodeSizeInfo[0] * (defaultDistance - constants.BARCODE_SPRITE_GAP) / defaultDistance;
    const topLeftPointX = x - barcodeSizeInfo[3] * (defaultDistance - constants.BARCODE_SPRITE_GAP) / defaultDistance;;
    const topLeftPointY = y - barcodeSizeInfo[0] * (defaultDistance - constants.BARCODE_SPRITE_GAP) / defaultDistance;
    const topRightPointX = x + barcodeSizeInfo[1] * (defaultDistance - constants.BARCODE_SPRITE_GAP) / defaultDistance;
    switch (spriteIdx){
      case 0:  // Barcode box sprite
        x = topLeftPointX;
        y = topLeftPointY;
        return {x, y};
      case 8:
        return {x, y};
      case 4:  // . sprite
        if(topDistance > (yScale * constants.BARCODE_DIGIT_HEIGHT)){
          x = topLeftPointX + (barcodeWidth) / 2;
          y = topLeftPointY - (constants.BARCODE_DIGIT_OFFSET + constants.BARCODE_DIGIT_HEIGHT / 2) * yScale;
          return {x, y};
        };
        // can't render barcode number as gap is lesser than
        // size needed to rebder it
        return {x: undefined, y: undefined};
      default: // Digit sprite
        if(topDistance > (yScale * constants.BARCODE_DIGIT_HEIGHT)){
          if (spriteIdx < 4) {
            x = topLeftPointX + (spriteIdx - 1) * (barcodeWidth) / 7;
            y = topLeftPointY - (constants.BARCODE_DIGIT_HEIGHT * yScale);
            return {x, y};
          };
          x = topRightPointX - (8 - spriteIdx) * (barcodeWidth) / 7;
          y = topLeftPointY - (constants.BARCODE_DIGIT_HEIGHT * yScale);
          return {x, y};
        };
        return {x: undefined, y: undefined};
    }
  }
);