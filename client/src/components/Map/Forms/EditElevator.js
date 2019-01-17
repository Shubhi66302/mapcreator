// // technically components should not be connected to app state but it's ok for our case.
// import React from "react";
// import BaseJsonForm from "./Util/BaseJsonForm";
// import { connect } from "react-redux";
// import { addPPSes } from "actions/pps";
// import { directionSchema } from "utils/forms";

// const schema = {
//   title: "Edit Elevator",
//   type: "object",
//   required: ["elevator_id", "entry_barcodes"],
//   properties: {
//     elevator_id: { type: "integer", title: "Id" },
//     entry_barcodes: { type: "array", items: { type: "string" } }
//   }
// };

// const EditElevator = ({ onSubmit, disabled }) => (
//   <BaseJsonForm
//     small={true}
//     disabled={disabled}
//     schema={schema}
//     onSubmit={onSubmit}
//     buttonText={"Edit"}
//   />
// );

// // only connecting to minimal state since don't know if data will be copied in props...
// // export default connect(
// //   state => ({
// //     disabled: Object.keys(state.selection.mapTiles).length === 0
// //   }),
// //   dispatch => ({
// //     onSubmit: ({ formData }) => {
// //       dispatch(addPPSes(formData));
// //     }
// //   })
// // )(AddPPS);

// export default EditElevator;
// //

import React, { Component } from "react";
import { Formik, Form, Field, withFormik, FieldArray } from "formik";
import ButtonForm from "./Util/ButtonForm";
import { connect } from "react-redux";
import { FormikedInput } from "components/InlineTextInput";
import { addFloor } from "actions/floor";
import SweetAlertError from "components/SweetAlertError";
import { number, object, ref } from "yup";

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
      <FieldArray
        name="entry_barcodes"
        render={arrayHelpers => (
          <div>
            Entry Barcodes:
            {values.entry_barcodes.map((_barcode, index) => (
              <div className="card py-1" key={index}>
                <div className="card-body">
                  <div key={index}>
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
              className="btn btn-outline-success btn-sm"
              type="button"
              onClick={() =>
                arrayHelpers.push({
                  barcode: "",
                  boom_barrier_id: 1,
                  floor_id: 1
                })
              }
            >
              Add
            </button>
          </div>
        )}
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
    dispatch(addFloor(formValues));
    onSuccess();
  }
})(InnerForm);

// const NestedExample = () => (

// );

class EditElevator extends Component {
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
      >
        <MyForm onSuccess={this.toggle} elevator_id={1} />
      </ButtonForm>
    );
  }
}

export default EditElevator;
