import React from "react";
import { addHighwayQueue } from "actions/actions";
import { connect } from "react-redux";

const AddHighwayQueue = ({ onClick, disabled }) => (
  <button
    disabled={disabled}
    type="button"
    className="btn btn-secondary"
    style={{ textAlign: "-webkit-center", color: "orange" }}
    onClick={() => {
      onClick();
    }}
  >
    Add Highway Queue
  </button>
);

export default connect(
  state => ({
    disabled:
      Object.keys(state.selection.mapTiles).length === 0 ||
      !state.selection.queueMode
  }),
  dispatch => ({
    onClick: () => dispatch(addHighwayQueue())
  })
)(AddHighwayQueue);
