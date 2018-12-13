// text input (text or number) with validation and error
import React from "react";

export default ({ label, errorMessage, touched, name, ...props }) => (
  <div className="form-group row justify-content-between">
    <label htmlFor={name} className="col-form-label col-sm-3">
      {label}
    </label>
    <div className="col-sm-9">
      <input className="form-control" id={name} name={name} {...props} />
      {touched &&
        errorMessage && (
        <small className="form-text text-danger">{errorMessage}</small>
      )}
    </div>
  </div>
);
