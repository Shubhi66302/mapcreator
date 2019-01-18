import React from "react";
import { FieldArray } from "formik";
const FieldArrayErrors = ({ errors, name }) =>
  typeof errors[name] === "string" ? (
    <small className="form-text text-danger">{errors[name]}</small>
  ) : null;
const FormikedArrayInput = ({
  renderElm,
  values,
  name,
  label,
  errors,
  defaultEntry
}) => (
  <FieldArray
    name={name}
    render={arrayHelpers => (
      <div>
        {label}:
        {values[name].map((_something, index) => (
          <div className="card my-1" key={index}>
            <div className="card-body">
              <div key={index}>
                {renderElm(index)}
                <button
                  className="btn btn-outline-danger btn-sm"
                  type="button"
                  onClick={() => arrayHelpers.remove(index)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        <FieldArrayErrors errors={errors} name={name} />
        <button
          className="btn btn-outline-success btn-sm my-2 pl-2"
          type="button"
          onClick={() => arrayHelpers.push(defaultEntry)}
        >
          Add
        </button>
      </div>
    )}
  />
);

export default FormikedArrayInput;
