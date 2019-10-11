// mainly selectors for map rendering
import { getBarcodeSize } from "./barcode-selectors";
import { createSelector } from "reselect";
import * as constants from "../../constants";
import {
  tileToWorldCoordinate,
  getTileBoundingBox
} from "./world-coordinate-utils-selectors";

// Scale is for stretching out the barcode.png sprite to exactly fit the tile
// bounding box. Hence it is not {1,1} for the default sprite but some other value.
export const getTileSpriteScale = createSelector(
  getBarcodeSize,
  barcodeSizeInfo => {
    const barcodeSizeXInCADCoordinates =
      barcodeSizeInfo[1] + barcodeSizeInfo[3];
    const barcodeSizeYInCADCoordinates =
      barcodeSizeInfo[0] + barcodeSizeInfo[2];
    const defDistance = constants.DEFAULT_DISTANCE_BW_BARCODES;
    // Read tests to understand this calculation
    const xScale =
      (barcodeSizeXInCADCoordinates / defDistance) * constants.DEFAULT_X_SCALE;
    const yScale =
      (barcodeSizeYInCADCoordinates / defDistance) * constants.DEFAULT_Y_SCALE;
    return { xScale, yScale };
  }
);

export const spriteRenderCoordinateSelector = createSelector(
  tileToWorldCoordinate,
  getTileSpriteScale,
  (state_, { spriteIdx }) => ({ spriteIdx }),
  getTileBoundingBox,
  ({ x: centreX, y: centreY }, { yScale }, { spriteIdx }, boundingBox) => {
    // Width of barcode sprite
    var barcodeWidth = boundingBox.right - boundingBox.left;
    // vertical distance within which barcode numbers appear
    var topDistance = centreY - boundingBox.top;
    let x, y;
    switch (spriteIdx) {
      case 0: // Barcode box sprite
        x = boundingBox.left;
        y = boundingBox.top;
        return { x, y };
      case 8: // centre '.' sprite
        return { x: centreX, y: centreY };
      case 4: // barcode string's '.' sprite
        if (topDistance > yScale * constants.BARCODE_DIGIT_HEIGHT) {
          x = boundingBox.left + barcodeWidth / 2;
          y =
            boundingBox.top -
            (constants.BARCODE_DIGIT_OFFSET +
              constants.BARCODE_DIGIT_HEIGHT / 2) *
              yScale;
          return { x, y };
        }
        // can't render barcode number as gap is lesser than
        // size needed to render it
        return { x: undefined, y: undefined };
      default:
        // Digit sprite
        if (topDistance > yScale * constants.BARCODE_DIGIT_HEIGHT) {
          if (spriteIdx < 4) {
            x = boundingBox.left + ((spriteIdx - 1) * barcodeWidth) / 7;
            y = boundingBox.top - constants.BARCODE_DIGIT_HEIGHT * yScale;
            return { x, y };
          }
          x = boundingBox.right - ((8 - spriteIdx) * barcodeWidth) / 7;
          y = boundingBox.top - constants.BARCODE_DIGIT_HEIGHT * yScale;
          return { x, y };
        }
        // can't render barcode number as gap is lesser than
        // size needed to rebder it
        return { x: undefined, y: undefined };
    }
  }
);
