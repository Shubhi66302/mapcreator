import React, { Component } from "react";
import { withFormik, Field } from "formik";
import { withRouter } from "react-router-dom";
import { FormikedInput } from "components/InlineTextInput";
import { createMapFromCoordinateData, handleErrors } from "utils/util";
import SweetAlertError from "components/SweetAlertError";
import { string, object, ref } from "yup";
import { yupPosIntSchema } from "utils/forms";
// form html
const InnerForm = ({ handleSubmit, isSubmitting }) => {
  return (
    <form onSubmit={handleSubmit}>
      <Field name="name" component={FormikedInput} label="Name" type="text" />
      <Field
        name="row_start"
        component={FormikedInput}
        label="Row Start"
        type="number"
      />
      <Field
        name="row_end"
        component={FormikedInput}
        label="Row End"
        type="number"
      />
      <Field
        name="col_start"
        component={FormikedInput}
        label="Column Start"
        type="number"
      />
      <Field
        name="col_end"
        component={FormikedInput}
        label="Column"
        type="number"
      />
      <button type="submit" disabled={isSubmitting} className="btn btn-primary">
        Submit
      </button>
    </form>
  );
};

// form validation etc.
const Form = withFormik({
  mapPropsToValues: () => ({
    name: "",
    row_start: "",
    row_end: "",
    col_start: "",
    col_end: ""
  }),
  validationSchema: () => {
    return object().shape({
      name: string().required(),
      row_start: yupPosIntSchema,
      row_end: yupPosIntSchema.min(ref("row_start")),
      col_start: yupPosIntSchema,
      col_end: yupPosIntSchema.min(ref("col_start"))
    });
  },
  handleSubmit: (
    { name, row_start, row_end, col_start, col_end },
    { props, setSubmitting }
  ) => {
    // create a map with row_start etc.
    var map = createMapFromCoordinateData(
      row_start,
      row_end,
      col_start,
      col_end
    );
    const { onServerError, onSuccess } = props;
    fetch("/api/createMap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        map,
        name
      })
    })
      .then(handleErrors)
      .then(res => res.json())
      .then(id => {
        setSubmitting(false);
        onSuccess(id);
      })
      .catch(error => {
        setSubmitting(false);
        onServerError(error);
      });
  }
})(InnerForm);

class CreateMap extends Component {
  state = {
    error: undefined
  };
  render() {
    const { error } = this.state;
    const { history } = this.props;
    return (
      <div className="container">
        <SweetAlertError
          title="Server Error"
          error={error}
          onConfirm={() => this.setState({ error: undefined })}
        />
        <h3 className="display-5">Specify details of new map</h3>
        <Form
          onServerError={error => this.setState({ error })}
          onSuccess={id => history.push(`/map/${id}`)}
        />
      </div>
    );
  }
}

export default withRouter(CreateMap);
