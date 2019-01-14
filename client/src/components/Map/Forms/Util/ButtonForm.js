import React, { Component } from "react";
import FormModal from "./FormModal";
import BulletPointsTooltip from "./BulletPointsTooltip";

class ButtonForm extends Component {
  render() {
    const {
      disabled = false,
      buttonText = "Submit",
      tooltipData = {
        id: "default-tooltip-id"
      },
      toggle,
      show
    } = this.props;
    return (
      <div>
        <div className="tooltip-wrapper" data-tip data-for={tooltipData.id}>
          <button
            key={0}
            type="button"
            className="btn btn-outline-primary"
            disabled={disabled}
            onClick={() => toggle()}
          >
            {buttonText}
          </button>
        </div>
        <BulletPointsTooltip {...tooltipData} />
        <div key={1} className="modal fade" tabIndex="-1" role="dialog">
          <FormModal show={show} toggle={toggle}>
            {this.props.children}
          </FormModal>
        </div>
      </div>
    );
  }
}

export default ButtonForm;
