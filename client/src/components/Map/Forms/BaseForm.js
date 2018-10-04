import React, { Component } from "react";
import Form from "react-jsonschema-form";
import FormModal from "./FormModal";
import BulletPointsTooltip from "./BulletPointsTooltip";

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
      validate = null,
      uiSchema = undefined,
      tooltipData = {
        id: "default-tooltip-id"
      }
    } = this.props;
    return (
      <div>
        <div className="tooltip-wrapper" data-tip data-for={tooltipData.id}>
          <button
            key={0}
            type="button"
            className="btn btn-outline-primary"
            disabled={disabled}
            onClick={() => this.setState({ show: true })}
          >
            {buttonText}
          </button>
        </div>
        <BulletPointsTooltip {...tooltipData} />
        <div key={1} className="modal fade" tabIndex="-1" role="dialog">
          <FormModal
            show={this.state.show}
            toggle={() => this.setState({ show: !this.state.show })}
          >
            <Form
              schema={schema}
              uiSchema={uiSchema}
              onSubmit={formData => {
                this.setState({ show: false });
                onSubmit(formData);
              }}
              onError={onError}
              validate={validate}
            />
          </FormModal>
        </div>
      </div>
    );
  }
}

export default BaseForm;
