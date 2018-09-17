// technically components should not be connected to app state but it's ok for our case.
import React, { Component } from "react";
import Form from "react-jsonschema-form";
import BaseForm from "./BaseForm";
import { connect } from "react-redux";
import { addPPSes } from "actions/pps";
import { getIdsForEntities, coordinateKeyToBarcode } from "utils/util";
import _ from "lodash";
import { directionSchema } from "utils/forms";

const schema = {
  title: "Add PPS",
  type: "object",
  required: ["pick_direction"],
  properties: {
    pick_direction: { ...directionSchema, title: "Pick Direction" }
  }
};

const AddPPS = ({ onSubmit, disabled }) => (
  <BaseForm
    disabled={disabled}
    schema={schema}
    onSubmit={onSubmit}
    buttonText={"Assign PPS"}
  />
);

// only connecting to minimal state since don't know if data will be copied in props...
export default connect(
  state => ({
    disabled: Object.keys(state.selectedTiles).length === 0
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      // state is not accessible here so using a workaround to access it in action creator...
      dispatch(addPPSes(formData));
    }
  })
)(AddPPS);
