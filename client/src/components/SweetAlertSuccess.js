import React from "react";
import SweetAlert from "react-bootstrap-sweetalert";

var SweetAlertSuccess = ({ message, onConfirm, title = "Success" }) => (
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

export default SweetAlertSuccess;
