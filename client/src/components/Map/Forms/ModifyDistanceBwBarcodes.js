// technically components should not be connected to app state but it's ok for our case.
import React, { Component } from "react";
import BaseForm from "./BaseForm";
import { connect } from "react-redux";
import { modifyDistanceBetweenBarcodes } from "actions/barcode";
import _ from "lodash";

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

const ModifyDistanceBwBarcodes = ({ dispatch, disabled }) => (
  <BaseForm
    disabled={disabled}
    schema={schema}
    onSubmit={({ formData }) =>
      dispatch(modifyDistanceBetweenBarcodes(formData))
    }
    buttonText={"Modify Distance b/w barcodes"}
  />
);

export default connect(state => ({
  disabled: Object.keys(state.selection.distanceTiles).length === 0
}))(ModifyDistanceBwBarcodes);
