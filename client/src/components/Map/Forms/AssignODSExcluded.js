// technically components should not be connected to app state but it's ok for our case.
import React, { Component } from "react";
import Form from "react-jsonschema-form";
import BaseForm from "./BaseForm";
import { connect } from "react-redux";
// import { addEntities } from "actions/actions";
import { getIdsForEntities } from "utils/util";
import _ from "lodash";
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
    buttonText={"ODS Excluded"}
  />
);

export default connect(
  state => ({
    disabled: Object.keys(state.selectedTiles).length === 0
  }),
  dispatch => ({
    onSubmit: formData => {
      // state is not accessible here so using a workaround to access it in action creator...
      // TODO: define what needs to be done
    }
  })
)(AssignODSExcluded);
