import React from "react";
import { assignStorable } from "actions/actions";
import { connect } from "react-redux";

const StorableButton = ({ onClick, disabled }) => (
  <button
    disabled={disabled}
    type="button"
    className="btn btn-outline-primary"
    onClick={() => {
      onClick();
    }}
  >
    Assign Storable
  </button>
);

export default connect(
  state => ({
    disabled: Object.keys(state.selection.mapTiles).length === 0
  }),
  dispatch => ({
    onClick: () => dispatch(assignStorable())
  })
)(StorableButton);
