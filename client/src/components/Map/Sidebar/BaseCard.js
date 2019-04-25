import React, { Component } from "react";
import "./BaseCard.css";

class BaseCard extends Component {
  state = {
    open: false
  };
  render() {
    const { children, title } = this.props;
    return (
      <div className="card my-1">
        <div className="card-header py-1">
          <h5 className="mb-0">
            <button
              onClick={() => this.setState({ open: !this.state.open })}
              className="btn btn-link"
            >
              {title}
            </button>
          </h5>
        </div>
        <div className={`collapsible-content ${this.state.open ? "open" : ""}`}>
          <div className="card-body content-innter">{children}</div>
        </div>
      </div>
    );
  }
}

export default BaseCard;
