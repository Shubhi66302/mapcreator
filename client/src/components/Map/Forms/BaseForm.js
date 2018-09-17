import React, { Component } from "react";
import Form from "react-jsonschema-form";
import FormModal from "./FormModal";

class BaseForm extends Component {
  state = {
    show: false
  };
  render() {
    const {
      schema,
      onSubmit,
      onError = () => {},
      buttonText = "Submit",
      disabled = false,
      validate = null
    } = this.props;
    return [
      <button
        key={0}
        type="button"
        className="btn btn-outline-primary"
        disabled={disabled}
        onClick={() => this.setState({ show: true })}
      >
        {buttonText}
      </button>,
      <div key={1} className="modal fade" tabIndex="-1" role="dialog">
        <FormModal
          show={this.state.show}
          toggle={() => this.setState({ show: !this.state.show })}
        >
          <Form
            schema={schema}
            onSubmit={formData => {
              this.setState({ show: false });
              onSubmit(formData);
            }}
            onError={onError}
            validate={validate}
          />
        </FormModal>
      </div>
    ];
  }
}

export default BaseForm;
