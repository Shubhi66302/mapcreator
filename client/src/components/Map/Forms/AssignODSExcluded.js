// technically components should not be connected to app state but it's ok for our case.
import React from "react";
import BaseForm from "./BaseForm";
import { connect } from "react-redux";
// import { addEntities } from "actions/actions";
import { directionSchema } from "utils/forms";

const schema = {
  title: "Assign ODS Excluded",
  type: "object",
  required: ["excludeddr"],
  properties: {
    excludeddr: {
      ...directionSchema,
      title: "ODS Excluded direction"
    }
  }
};

const AssignODSExcluded = ({ onSubmit, disabled }) => (
  <BaseForm
    disabled={disabled}
    schema={schema}
    onSubmit={onSubmit}
    buttonText={"Assign ODS Excluded"}
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
)(AssignODSExcluded);
