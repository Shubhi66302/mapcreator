import React, { Component } from "react";
import { Formik, Form, Field, withFormik, FieldArray } from "formik";
import ButtonForm from "./Util/ButtonForm";
import { connect } from "react-redux";
import { FormikedInput } from "components/InlineTextInput";
import { number, object, ref } from "yup";

const FormikedArrayInput = ({
  renderElm,
  values,
  name,
  label,
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
// form html
// not using BaseForm as more advanced validation needed
const InnerForm = ({ handleSubmit, isSubmitting, values }) => {
  return (
    <form onSubmit={handleSubmit}>
      <Field
        name="elevator_id"
        component={props => <FormikedInput {...props} readOnly={true} />}
        label="Elevator ID"
        type="number"
      />
      <FormikedArrayInput
        name="entry_barcodes"
        values={values}
        label="The BrCOES"
        renderElm={index => (
          <div>
            <Field
              name={`entry_barcodes[${index}].barcode`}
              component={FormikedInput}
              label="Barcode"
            />
            <Field
              name={`entry_barcodes[${index}].boom_barrier_id`}
              component={FormikedInput}
              label="Barrier ID"
            />
            <Field
              name={`entry_barcodes[${index}].floor_id`}
              component={FormikedInput}
              label="Floor ID"
            />
          </div>
        )}
        defaultEntry={{
          barcode: "",
          boom_barrier_id: 1,
          floor_id: 1
        }}
      />

      <button type="submit" disabled={isSubmitting} className="btn btn-primary">
        Submit
      </button>
    </form>
  );
};

// form validation etc.
const MyForm = withFormik({
  mapPropsToValues: ({ elevator_id }) => ({
    elevator_id,
    entry_barcodes: [
      {
        barcode: "000.000",
        boom_barrier_id: 4,
        floor_id: 1
      }
    ]
  }),
  // validationSchema: () => {
  //   var posIntSchema = number()
  //     .required()
  //     .positive()
  //     .integer();
  //   return object().shape({
  //     floor_id: posIntSchema,
  //     row_start: posIntSchema,
  //     row_end: posIntSchema.min(ref("row_start")),
  //     column_start: posIntSchema,
  //     column_end: posIntSchema.min(ref("column_start"))
  //   });
  // },
  handleSubmit: (formValues, { props }) => {
    const { onSuccess, dispatch } = props;
    // dispatch(addFloor(formValues));
    onSuccess();
  }
})(InnerForm);

// const NestedExample = () => (

// );

class EditEntryPoints extends Component {
  state = {
    error: undefined,
    show: false
  };
  toggle = () => this.setState({ show: !this.state.show });
  render() {
    return (
      <ButtonForm
        show={this.state.show}
        toggle={this.toggle}
        tooltipData={{ id: "add-floor", title: "Add Floor" }}
        buttonText="Edit"
        small={true}
      >
        <MyForm onSuccess={this.toggle} elevator_id={1} />
      </ButtonForm>
    );
  }
}

export default EditEntryPoints;
