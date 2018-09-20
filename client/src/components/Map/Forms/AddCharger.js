// technically components should not be connected to app state but it's ok for our case.
import React, { Component } from "react";
import Form from "react-jsonschema-form";
import BaseForm from "./BaseForm";
import { connect } from "react-redux";
import { addChargers } from "actions/charger";
import { getIdsForEntities } from "utils/util";
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
    disabled: Object.keys(state.selectedTiles).length === 0
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      // state is not accessible here so using a workaround to access it in action creator...
      // TODO: define what needs to be done
      dispatch(addChargers(formData));
      // dispatch(
      //   addEntities({
      //     reducerKey: "PPS",
      //     entityKey: "pps",
      //     floorKey: "ppses",
      //     idField: "pps_id",
      //     createEntities: createPPSEntities(formData)
      //   })
      // );
    }
  })
)(AddCharger);
