// technically components should not be connected to app state but it's ok for our case.
import React from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import { modifyDistanceBetweenBarcodes } from "actions/barcode";

const getSchema = (directionSchema) => ({
  title: "Modify distance in given direction for barcodes",
  type: "object",
  required: ["distance", "direction"],
  properties: {
    distance: {
      title: "Distance",
      type: "integer"
    },
    direction: directionSchema || {title: "Direction"}
  }
});


const tooltipData = {
  id: "modify-distance-in-given-direction-for-barcodes",
  title: "Modify distance in given direction for barcodes",
  bulletPoints: [
    "Will increase the distance by given distance value for all barcodes for" +
    "selected distance tile in given direction"
  ]
};

const ModifyDistanceBwBarcodes = ({ dispatch, disabled, direction }) => (
  <BaseJsonForm
    disabled={disabled}
    schema={getSchema(direction)}
    onSubmit={({ formData }) =>
      dispatch(modifyDistanceBetweenBarcodes(formData))
    }
    buttonText={"Modify Distance b/w barcodes"}
    tooltipData={tooltipData}
  />
);

export const getUpdatedSchema = state => {
  var isRowDistanceTileSelected = false;
  var isColumnDistanceTileSelected = false;
  const selectedDistanceTiles = state.selection.distanceTiles;
  for(var key in selectedDistanceTiles){
    if(/c-.*/.test(key)) {isColumnDistanceTileSelected = true;};
    if(/r-.*/.test(key)) {isRowDistanceTileSelected = true;};
  };
  if((isRowDistanceTileSelected && isColumnDistanceTileSelected) ||
    ((!isRowDistanceTileSelected) && (!isColumnDistanceTileSelected))){
    return {disabled: true};
  };
  if (isColumnDistanceTileSelected){
    // column distance tiles selected
    return {
      disabled: false,
      direction: {
        type: "integer",
        title: "Direction",
        default: 1,
        enum: [1, 3],
        enumNames: ["Right", "Left"]
      }
    };
  };
  // row distance tiles selected
  return {
    disabled: false,
    direction: {
      type: "integer",
      title: "Direction",
      default: 0,
      enum: [0, 2],
      enumNames: ["Top", "Down"]
    }
  };
};

export default connect(state => {
  return getUpdatedSchema(state);
})(ModifyDistanceBwBarcodes);
