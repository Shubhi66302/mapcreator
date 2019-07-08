import React, { Component } from "react";
import "./BaseCard.css";

class BaseCard extends Component {
  state = {
    open: false
  };
  render() {
    const { children, title,isCollapsible = true  } = this.props;
    return (
      <div className="card my-1">
        <div className="card-header py-1">
          <h5 className="mb-0">
            
            {
              isCollapsible ? <button
                onClick={() => this.setState({ open: !this.state.open })}
                className="btn btn-link" 
              >
                {title}
              </button> : <p className = "btn btn-default disabled">  {title} </p>

            }
          </h5>
        </div>
        {
          isCollapsible && 
                (
                  <div className={`collapsible-content ${this.state.open ? "open" : ""}`}>
                    <div className="card-body content-innter">{children}</div>
                  </div>
                )
        }
      </div>
    );
  }
}

export default BaseCard;
