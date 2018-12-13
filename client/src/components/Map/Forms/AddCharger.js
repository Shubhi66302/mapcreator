// technically components should not be connected to app state but it's ok for our case.
import React from "react";
import BaseForm from "./BaseForm";
import { connect } from "react-redux";
import { addChargers } from "actions/charger";
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

const tooltipData = {
  id: "add-charger",
  title: "Add a charger",
  bulletPoints: [
    "Can only add one charger at a time.",
    "Can't add charger at periphery in a direction so that entry point would be outside map, please don't try.",
    "Also creates a special barcode with barcode 500.500 and above to accomodate map expansion",
    "Distance b/w special barcode and its neighbours is hardcoded but can be changed later in json"
  ]
};

const AddCharger = ({ onSubmit, disabled }) => (
  <BaseForm
    disabled={disabled}
    schema={schema}
    onSubmit={onSubmit}
    buttonText={"Assign Charger"}
    tooltipData={tooltipData}
  />
);

export default connect(
  state => ({
    // TODO: disabling adding multiple chargers; adding neighbouring chargers together messes up
    // adjacency, should be fixed...
    disabled: Object.keys(state.selection.mapTiles).length !== 1
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(addChargers(formData));
    }
  })
)(AddCharger);
