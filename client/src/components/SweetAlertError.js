import React from "react";
import SweetAlert from "react-bootstrap-sweetalert";

var SweetAlertError = ({ error, onConfirm, title = "Error" }) => {
  let parsedError;
  try {
    parsedError = JSON.stringify(JSON.parse(error), null, 2);
  } catch (e) {
    parsedError = error;
  }
  return (
    <SweetAlert show={error != null} error title={title} onConfirm={onConfirm}>
      <pre>
        <code>{error == null ? "" : `${parsedError}`}</code>
      </pre>
    </SweetAlert>
  );
};

export default SweetAlertError;
