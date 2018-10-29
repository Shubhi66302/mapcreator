// technically components should not be connected to app state but it's ok for our case.
import React, { Component } from "react";
import BaseForm from "./BaseForm";
import { connect } from "react-redux";
// import { addEntities } from "actions/actions";
import { addFireEmergencies } from "actions/fireEmergency";
import _ from "lodash";

const schema = {
  title: "Fire Emergency Barcodes",
  type: "object",
  required: ["group_id", "type"],
  properties: {
    type: {
      type: "string",
      enum: ["shutter", "escape_path"],
      enumNames: ["Shutters", "Escape Path"],
      title: "Type",
      default: "shutter"
    },
    group_id: { type: "string", title: "Group ID" }
  }
};

const AssignEmergencyBarcode = ({ onSubmit, disabled }) => (
  <BaseForm
    disabled={disabled}
    schema={schema}
    onSubmit={onSubmit}
    buttonText={"Assign Emergency Barcode"}
  />
);

export default connect(
  state => ({
    disabled: Object.keys(state.selection.mapTiles).length === 0
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(addFireEmergencies(formData));
    }
  })
)(AssignEmergencyBarcode);
