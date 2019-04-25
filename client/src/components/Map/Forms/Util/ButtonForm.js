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
      small = false,
      btnClass = "btn-outline-primary",
      show,
      wrapInButtonGroup = true
    } = this.props;
    return (
      // adding class and role since nested button groups give a cleaner look for some reason
      // making it configurable since single button in a btn-group looks wierd
      <div className={wrapInButtonGroup ? "btn-group" : undefined} role="group">
        <button
          key={0}
          type="button"
          className={`btn ${btnClass} ${
            small ? "btn-sm" : ""
          } tooltip-wrapper btn-group`}
          disabled={disabled}
          onClick={() => toggle()}
          data-tip
          data-for={tooltipData.id}
        >
          {buttonText}
        </button>
        <BulletPointsTooltip {...tooltipData} />
        <div key={1} className="modal fade" tabIndex="-1" role="dialog">
          <FormModal show={show} toggle={toggle}>
            <div>{this.props.children}</div>
          </FormModal>
        </div>
      </div>
    );
  }
}

export default ButtonForm;
