import React, { Component } from "react";
import "./Sidebar.css";

var Menu = ({ menuItems }) => (
  <div className="row">
    {menuItems.map(({ name, isActive, onClick }, idx) => (
      <div
        className={`col sidebar-icon ${isActive ? "active" : ""}`}
        key={idx}
        onClick={onClick}
      >
        <i className={`fa ${name}`} />
      </div>
    ))}
  </div>
);

class Sidebar extends Component {
  state = {
    open: false,
    activeIdx: 0
  };
  render() {
    const { open, activeIdx } = this.state;
    var menuItemIconNames = ["fa-charging-station", "fa-archive"];
    return (
      <nav id="sidebar" className={open ? "active" : ""}>
        <button
          id="sidebar-button"
          className="btn"
          onClick={() => this.setState({ open: !this.state.open })}
        >
          <i className="fa fa-lg fa-bars" />
        </button>
        <div className="container menu-container">
          <Menu
            menuItems={menuItemIconNames.map((name, idx) => ({
              name,
              isActive: activeIdx === idx,
              onClick: () => this.setState({ activeIdx: idx })
            }))}
          />
        </div>
        <small id="version-text">
          {process.env.REACT_APP_VERSION || "unknown version"}
        </small>
      </nav>
    );
  }
}

export default Sidebar;
