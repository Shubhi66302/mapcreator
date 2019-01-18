// text input (text or number) with validation and error
import React from "react";
import { getIn } from "formik";
const InlineInput = ({ label, errorMessage, touched, name, children }) => (
  <div className="form-group row justify-content-between">
    <label htmlFor={name} className="col-form-label col-sm-3">
      {label}
    </label>
    <div className="col-sm-9">
      {children}
      {touched && errorMessage && (
        <small className="form-text text-danger">{errorMessage}</small>
      )}
    </div>
  </div>
);

const InlineTextInput = ({ errorMessage, touched, ...props }) => (
  <InlineInput {...props} errorMessage={errorMessage} touched={touched}>
    <input
      className="form-control"
      id={props.name}
      name={props.name}
      {...props}
    />
  </InlineInput>
);

export const InlineSelectInput = ({
  errorMessage,
  touched,
  valuesAndLabels,
  ...props
}) => (
  <InlineInput {...props} errorMessage={errorMessage} touched={touched}>
    <select
      className="form-control"
      id={props.name}
      name={props.name}
      {...props}
    >
      {valuesAndLabels.map(([value, label], idx) => (
        <option key={idx} value={value}>
          {label}
        </option>
      ))}
    </select>
  </InlineInput>
);

export const FormikedInput = ({
  field,
  form: { touched, errors },
  type,
  ...props
}) => (
  <InlineTextInput
    errorMessage={getIn(errors, field.name)}
    touched={getIn(touched, field.name)}
    type={type || "text"}
    {...field}
    {...props}
  />
);

export const FormikedSelectInput = ({
  field,
  form: { touched, errors },
  valuesAndLabels,
  ...props
}) => (
  <InlineSelectInput
    errorMessage={getIn(errors, field.name)}
    touched={getIn(touched, field.name)}
    valuesAndLabels={valuesAndLabels}
    {...field}
    {...props}
  />
);

export default InlineTextInput;
