// technically components should not be connected to app state but it's ok for our case.
import React from "react";
import { connect } from "react-redux";
import { removeOdsExcludeds } from "actions/odsExcluded";

const RemoveODSButton = ({ onClick, disabled }) => (
  <button
    disabled={disabled}
    type="button"
    className="btn btn-secondary"
    style={{textAlign:"-webkit-center", color:"orange"}}
    onClick={() => {
      onClick();
    }}
  >
    Remove ODS
  </button>
);

const CheckODS = (odsExcluded, mapTiles) => {
  let disableButton = Object.keys(mapTiles).length === 0 ? true : false;
  Object.keys(mapTiles).forEach((barcode) => {
    var hasBarcodeInODS = false;
    Object.keys(odsExcluded).forEach((ods) => {
      if(barcode === odsExcluded[ods].coordinate) {
        hasBarcodeInODS = true;
        if(!odsExcluded[ods].excluded) disableButton = true;
      }
    });
    if(!hasBarcodeInODS) disableButton = true;
  });
  return disableButton;
};

export default connect(
  state => ({
    disabled: CheckODS(state.normalizedMap.entities.odsExcluded, state.selection.mapTiles)
  }),
  dispatch => ({
    onClick: () => dispatch(removeOdsExcludeds())
  })
)(RemoveODSButton);
