import React, { Component } from "react";
import Form from "react-jsonschema-form";
import ButtonForm from "./ButtonForm";

class BaseForm extends Component {
  state = {
    show: false,
    formData: {}
  };
  toggle = () => this.setState({ show: !this.state.show, formData: {} });
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
          onChange={({ formData }) => this.setState({ formData })}
          formData={this.state.formData}
          onError={onError}
          validate={validate}
        />
      </ButtonForm>
    );
  }
}

export default BaseForm;
