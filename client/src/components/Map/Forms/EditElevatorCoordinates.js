// Will use this component for both entry and exit barcodes since they are mostly the same
import React, { Component } from "react";
import { Field, withFormik } from "formik";
import ButtonForm from "./Util/ButtonForm";
import { FormikedInput, FormikedSelectInput } from "components/InlineTextInput";
import FormikedArrayInput from "components/FormikedArrayInput";
import {
  directionsAndNames,
  yupCoordinateListSchema,
  yupPosIntSchema
} from "utils/forms";
import { object } from "yup";

const InnerForm = ({ handleSubmit, isSubmitting, values, errors }) => {
  return (
    <form onSubmit={handleSubmit}>
      <Field
        name="elevator_id"
        component={props => <FormikedInput {...props} readOnly={true} />}
        label="Elevator ID"
        type="number"
      />
      <FormikedArrayInput
        name={"coordinate_list"}
        values={values}
        errors={errors}
        label={"Coordinate List"}
        renderElm={index => (
          <div>
            <Field
              name={`${"coordinate_list"}[${index}].coordinate`}
              component={FormikedInput}
              label="Coordinate"
            />
            <Field
              name={`${"coordinate_list"}[${index}].direction`}
              component={props => (
                <FormikedSelectInput
                  {...props}
                  valuesAndLabels={directionsAndNames}
                />
              )}
              label="Direction"
            />
          </div>
        )}
        defaultEntry={{
          coordinate: "",
          direction: 2
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
  mapPropsToValues: ({ elevator_id, coordinate_list }) => ({
    elevator_id,
    coordinate_list
  }),
  validationSchema: () => {
    return object().shape({
      elevator_id: yupPosIntSchema,
      coordinate_list: yupCoordinateListSchema
    });
  },
  handleSubmit: (formValues, { props }) => {
    const { onSuccess } = props;
    onSuccess(formValues);
  }
})(InnerForm);

class EditElevatorCoordinates extends Component {
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

export default EditElevatorCoordinates;
