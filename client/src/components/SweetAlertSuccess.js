import React from "react";
import SweetAlert from "react-bootstrap-sweetalert";

export default ({ message, onConfirm, title = "Success" }) => (
  <SweetAlert
    show={message != null}
    success
    title={title}
    onConfirm={onConfirm}
  >
    <pre>
      <code>{message == null ? "" : `${message}`}</code>
    </pre>
  </SweetAlert>
);
