// technically components should not be connected to app state but it's ok for our case.
import React from "react";
import BaseForm from "./BaseForm";
import { connect } from "react-redux";
import { modifyDistanceBetweenBarcodes } from "actions/barcode";

const schema = {
  title: "Modify distance between barcodes",
  type: "object",
  required: ["distance"],
  properties: {
    distance: {
      title: "Distance",
      type: "integer",
      minimum: 0
    }
  }
};

const tooltipData = {
  id: "modify-distance-bw-barcodes",
  title: "Modify distances between barcodes",
  bulletPoints: [
    "Will not modify distances between charger entry and charger, or other special barcodes.",
    "Hence the distance number will look the same even though other barcode distances have been modified."
  ]
};

const ModifyDistanceBwBarcodes = ({ dispatch, disabled }) => (
  <BaseForm
    disabled={disabled}
    schema={schema}
    onSubmit={({ formData }) =>
      dispatch(modifyDistanceBetweenBarcodes(formData))
    }
    buttonText={"Modify Distance b/w barcodes"}
    tooltipData={tooltipData}
  />
);

export default connect(state => ({
  disabled: Object.keys(state.selection.distanceTiles).length === 0
}))(ModifyDistanceBwBarcodes);
