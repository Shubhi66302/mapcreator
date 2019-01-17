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
      initialData = {},
      ...rest
    } = this.props;
    const {formData} = this.state;
    const fullFormData = {...formData, ...initialData};
    return (
      <ButtonForm {...rest} show={this.state.show} toggle={this.toggle}>
        <Form
          schema={schema}
          uiSchema={uiSchema}
          onSubmit={formData => {
            onSubmit(formData);
            this.toggle();
          }}
          onChange={({ formData }) => this.setState({ formData })}
          formData={fullFormData}
          onError={onError}
          validate={validate}
        />
      </ButtonForm>
    );
  }
}

export default BaseForm;
