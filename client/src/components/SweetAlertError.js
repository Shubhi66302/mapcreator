import React from "react";
import SweetAlert from "react-bootstrap-sweetalert";

export default ({ error, onConfirm, title = "Error" }) => (
  <SweetAlert show={error != null} error title={title} onConfirm={onConfirm}>
    <pre>
      <code>
        {error == null ? "" : `${JSON.stringify(JSON.parse(error), null, 2)}`}
      </code>
    </pre>
  </SweetAlert>
);
