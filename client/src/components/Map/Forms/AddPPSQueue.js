import React from "react";
import { addPPSQueue } from "actions/actions";
import { connect } from "react-redux";

const AddPPSQueue = ({ onClick, disabled }) => (
  <button
    disabled={disabled}
    type="button"
    className="btn btn-secondary"
    style={{ textAlign: "-webkit-center", color: "orange" }}
    onClick={() => {
      onClick();
    }}
  >
    Add PPS Queue
  </button>
);

export default connect(
  state => ({
    disabled:
      Object.keys(state.selection.mapTiles).length === 0 ||
      !state.selection.queueMode
  }),
  dispatch => ({
    onClick: () => dispatch(addPPSQueue())
  })
)(AddPPSQueue);
