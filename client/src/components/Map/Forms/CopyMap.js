// technically components should not be connected to app state but it's ok for our case.
import React from "react";
import BaseJsonForm from "./Util/BaseJsonForm";
import { connect } from "react-redux";
import { createMapCopy } from "actions/actions";
import { getMapName } from "utils/selectors";

const schema = {
  title: "Create Copy",
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string", title: "Name" }
  }
};

const tooltipData = {
  id: "copy-map",
  title: "Copy map",
  bulletPoints: [
    "Creates a copy of the map in the database with a different ID."
  ]
};

const CopyMap = ({ onSubmit, name }) => (
  <BaseJsonForm
    schema={schema}
    onSubmit={onSubmit}
    buttonText={"Create Copy"}
    btnClass="btn-outline-secondary"
    initialData={{ name: `${name} (copy)` }}
    tooltipData={tooltipData}
    bcolor="grey"
  />
);

export default connect(
  state => ({
    name: getMapName(state)
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(createMapCopy(formData));
    }
  })
)(CopyMap);
