import React from "react";
import SweetAlert from "react-bootstrap-sweetalert";

export default ({ error, onConfirm, title = "Error" }) => (
  <SweetAlert show={error != null} error title={title} onConfirm={onConfirm}>
    <pre>
      <code>{error == null ? "" : `${error}`}</code>
    </pre>
  </SweetAlert>
);
