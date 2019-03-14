import React from "react";
import { toggleStorable } from "actions/actions";
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
    Toggle Storable
  </button>
);

export default connect(
  state => ({
    disabled: Object.keys(state.selection.mapTiles).length === 0
  }),
  dispatch => ({
    onClick: () => dispatch(toggleStorable())
  })
)(StorableButton);
