import React from "react";
import { assignStorable } from "actions/actions";
import { connect } from "react-redux";

const StorableButton = ({ onClick, disabled }) => (
  <button
    disabled={disabled}
    type="button"
    className="btn btn-outline-primary"
    onClick={() => {
      console.log("clicked!");
      onClick();
    }}
  >
    Assign Storable
  </button>
);

export default connect(
  state => ({
    disabled: Object.keys(state.selectedTiles).length === 0
  }),
  dispatch => ({
    onClick: () => dispatch(assignStorable())
  })
)(StorableButton);
