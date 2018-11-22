// technically components should not be connected to app state but it's ok for our case.
import React from "react";
import BaseForm from "./BaseForm";
import { connect } from "react-redux";
// import { addEntities } from "actions/actions";

const schema = {
  title: "Assign Zone",
  type: "object",
  required: ["zone"],
  properties: {
    zone: {
      type: "string",
      title: "Zone name"
    }
  }
};

const AssignZone = ({ onSubmit, disabled }) => (
  <BaseForm
    disabled={disabled}
    schema={schema}
    onSubmit={onSubmit}
    buttonText={"Assign Zone"}
  />
);

export default connect(
  state => ({
    disabled: Object.keys(state.selection.mapTiles).length === 0
  }),
  () => ({
    onSubmit: () => {
      // state is not accessible here so using a workaround to access it in action creator...
      // TODO: define what needs to be done
    }
  })
)(AssignZone);
