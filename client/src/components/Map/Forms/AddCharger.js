// technically components should not be connected to app state but it's ok for our case.
import React, { Component } from "react";
import BaseForm from "./BaseForm";
import { connect } from "react-redux";
import { addChargers } from "actions/charger";
import _ from "lodash";
import { directionSchema } from "utils/forms";

const schema = {
  title: "Add Charger",
  type: "object",
  required: ["charger_direction"],
  properties: {
    charger_direction: {
      ...directionSchema,
      title: "Pick Direction"
    }
  }
};

const AddCharger = ({ onSubmit, disabled }) => (
  <BaseForm
    disabled={disabled}
    schema={schema}
    onSubmit={onSubmit}
    buttonText={"Assign Charger"}
  />
);

export default connect(
  state => ({
    disabled: Object.keys(state.selection.mapTiles).length === 0
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(addChargers(formData));
    }
  })
)(AddCharger);
