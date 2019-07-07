import React from "react";
import { connect } from "react-redux";
import { locateBarcode } from "actions/barcode";

const ClickableBarcodeString = ({ dispatch, barcodeString }) => (
  <a
    href="javascript:void(0)"
    onClick={() => dispatch(locateBarcode(barcodeString))}
  >
    {barcodeString}
  </a>
);

export default connect()(ClickableBarcodeString);
