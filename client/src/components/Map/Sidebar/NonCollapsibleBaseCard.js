import React, { Component } from "react";
import "./BaseCard.css";

class NonCollapsibleBaseCard extends Component {
  state = {
    open: true
  };
  render() {
    const { children } = this.props;
    return (
      <div className="card my-1">
        <div className={`collapsible-content ${this.state.open ? "open" : ""}`}>
          <div className="card-body content-innter">{children}</div>
        </div>
      </div>
    );
  }
}

export default NonCollapsibleBaseCard;