// Will use this component for both entry and exit barcodes since they are mostly the same
import React, { Component } from "react";
import { Field, withFormik } from "formik";
import ButtonForm from "./Util/ButtonForm";
import { FormikedInput, FormikedSelectInput } from "components/InlineTextInput";
import FormikedArrayInput from "components/FormikedArrayInput";
import { object } from "yup";
import { yupPosIntSchema, yupEntryExitBarcodesSchema } from "utils/forms";
const InnerForm = ({
  handleSubmit,
  isSubmitting,
  values,
  errors,
  barcodesFieldName,
  barcodesFieldLabel,
  floorIds
}) => {
  const valuesAndLabels = floorIds.map(floorId => [floorId, floorId]);
  return (
    <form onSubmit={handleSubmit}>
      <Field
        name="elevator_id"
        component={props => <FormikedInput {...props} readOnly={true} />}
        label="Elevator ID"
        type="number"
      />
      <FormikedArrayInput
        name={barcodesFieldName}
        values={values}
        errors={errors}
        label={barcodesFieldLabel}
        renderElm={index => (
          <div>
            <Field
              name={`${barcodesFieldName}[${index}].barcode`}
              component={FormikedInput}
              label="Barcode"
            />
            <Field
              name={`${barcodesFieldName}[${index}].boom_barrier_id`}
              component={FormikedInput}
              label="Barrier ID"
              type="number"
            />
            <Field
              name={`${barcodesFieldName}[${index}].floor_id`}
              component={props => (
                <FormikedSelectInput
                  {...props}
                  valuesAndLabels={valuesAndLabels}
                />
              )}
              label="Floor ID"
            />
          </div>
        )}
        defaultEntry={{
          barcode: "",
          boom_barrier_id: 1,
          floor_id: floorIds.length ? floorIds[0] : 1
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
  mapPropsToValues: ({ elevator_id, barcodes, barcodesFieldName }) => ({
    elevator_id,
    [barcodesFieldName]: barcodes
  }),
  validationSchema: ({ barcodesFieldName }) => {
    return object().shape({
      elevator_id: yupPosIntSchema,
      [barcodesFieldName]: yupEntryExitBarcodesSchema
    });
  },
  handleSubmit: (formValues, { props }) => {
    const { onSuccess } = props;
    onSuccess(formValues);
  }
})(InnerForm);

class EditEntryOrExitPoints extends Component {
  state = {
    error: undefined,
    show: false
  };
  toggle = () => this.setState({ show: !this.state.show });
  render() {
    const { onSubmit, ...rest } = this.props;
    return (
      <ButtonForm
        show={this.state.show}
        toggle={this.toggle}
        buttonText="Edit"
        small={true}
        wrapInButtonGroup={false}
      >
        <MyForm
          onSuccess={formValues => {
            onSubmit(formValues);
            this.toggle();
          }}
          {...rest}
        />
      </ButtonForm>
    );
  }
}

export default EditEntryOrExitPoints;
