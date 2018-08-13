// technically components should not be connected to app state but it's ok for our case.
import React, { Component } from "react";
import Form from "react-jsonschema-form";
import BaseForm from "./BaseForm";
import { connect } from "react-redux";
import { addEntities } from "actions/actions";
import { getIdsForEntities, coordinateKeyToBarcode } from "utils/util";
import _ from "lodash";

const schema = {
  title: "Add PPS",
  type: "object",
  required: ["pick_direction"],
  properties: {
    pick_direction: {
      type: "number",
      title: "Pick Direction",
      default: 0,
      enum: [0, 1, 2, 3],
      enumNames: ["Top", "Right", "Bottom", "Left"]
    }
  }
};

const AddPPS = ({ onSubmit, disabled }) => (
  <BaseForm
    disabled={disabled}
    schema={schema}
    onSubmit={onSubmit}
    onError={() => {}}
    buttonText={"Assign PPS"}
  />
);

// exported for testing
// TODO: add dock point logic if required. currently that doesn't seem to be used.
export const createPPSEntities = formData => (selectedTiles, existingPPSes) => {
  const numEntities = Object.keys(selectedTiles).length;
  var pps_ids = getIdsForEntities(numEntities, existingPPSes);
  const { pick_direction } = formData;
  var ppses = _.unzip([pps_ids, Object.keys(selectedTiles)]).map(
    ([pps_id, tileId]) => {
      const barcode = coordinateKeyToBarcode(tileId);
      return {
        pps_id,
        location: barcode,
        status: "disconnected",
        queue_barcodes: [],
        pick_position: barcode,
        pick_direction,
        pps_url: "",
        put_docking_positions: [],
        // default value for allowed_modes
        allowed_modes: ["put", "pick", "audit"]
      };
    }
  );
  return ppses;
};

// only connecting to minimal state since don't know if data will be copied in props...
export default connect(
  state => ({
    disabled: Object.keys(state.selectedTiles).length === 0
  }),
  dispatch => ({
    onSubmit: formData => {
      // state is not accessible here so using a workaround to access it in action creator...
      dispatch(
        addEntities({
          reducerKey: "PPS",
          entityKey: "pps",
          floorKey: "ppses",
          idField: "pps_id",
          createEntities: createPPSEntities(formData)
        })
      );
    }
  })
)(AddPPS);
