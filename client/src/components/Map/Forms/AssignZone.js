// technically components should not be connected to app state but it's ok for our case.
import React, { Component } from "react";
import Form from "react-jsonschema-form";
import BaseForm from "./BaseForm";
import { connect } from "react-redux";
// import { addEntities } from "actions/actions";
import { getIdsForEntities } from "utils/util";
import _ from "lodash";

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
    disabled: Object.keys(state.selectedTiles).length === 0
  }),
  dispatch => ({
    onSubmit: formData => {
      // state is not accessible here so using a workaround to access it in action creator...
      // TODO: define what needs to be done
    }
  })
)(AssignZone);
