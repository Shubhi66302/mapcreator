import React, { Component } from "react";
import Form from "react-jsonschema-form";
import ButtonForm from "./ButtonForm";

class BaseForm extends Component {
  state = {
    show: false
  };
  toggle = () => this.setState({ show: !this.state.show });
  render() {
    const {
      schema,
      onSubmit,
      onError = () => {},
      validate = null,
      uiSchema = undefined,
      initialFormData = undefined,
      ...rest
    } = this.props;
    return (
      <ButtonForm {...rest} show={this.state.show} toggle={this.toggle}>
        <Form
          formData={initialFormData}
          schema={schema}
          uiSchema={uiSchema}
          onSubmit={formData => {
            onSubmit(formData);
            this.toggle();
          }}
          onError={onError}
          validate={validate}
        />
      </ButtonForm>
    );
  }
}

export default BaseForm;
