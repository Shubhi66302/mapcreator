import React from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import { barcodeStringSchema, listOfBarcodesSchema } from "utils/forms";
import { addElevator } from "actions/elevator";

const schema = {
  title: "Add Elevator",
  type: "object",
  required: [
    "elevator_id",
    "position",
    "type",
    "entry_barcodes",
    "exit_barcodes"
  ],
  properties: {
    elevator_id: { type: "integer", title: "Id" },
    position: { ...barcodeStringSchema, title: "Position" },
    type: { type: "string", title: "Type" },
    entry_barcodes: { ...listOfBarcodesSchema, title: "Entry Points" },
    exit_barcodes: { ...listOfBarcodesSchema, title: "Exit Points" }
  }
};

const AddElevator = ({ onSubmit, disabled }) => (
  <BaseJsonForm
    disabled={disabled}
    schema={schema}
    onSubmit={onSubmit}
    buttonText={"Add Elevator"}
  />
);

// only connecting to minimal state since don't know if data will be copied in props...
export default connect(
  state => ({
    disabled: Object.keys(state.selection.mapTiles).length !== 1
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(addElevator(formData));
    }
  })
)(AddElevator);
