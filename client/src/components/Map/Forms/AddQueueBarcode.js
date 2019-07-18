import React from "react";
import { addQueueBarcodes } from "actions/actions";
import { connect } from "react-redux";

const AddQueueBarcodesButton = ({ onClick, disabled }) => (
  <button
    disabled={disabled}
    type="button"
    className="btn btn-secondary"
    style={{textAlign:"-webkit-center", color:"orange"}}
    onClick={() => {
      
      onClick();
    }}
  >
    Add Queue Barcodes
  </button>
);

export default connect(
  state => ({
    disabled: Object.keys(state.selection.mapTiles).length === 0 || !state.selection.queueMode
  }),
  dispatch => ({
    onClick: () => dispatch(addQueueBarcodes())
  })
)(AddQueueBarcodesButton);
