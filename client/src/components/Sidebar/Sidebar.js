import React, { Component } from "react";
import "./Sidebar.css";
import Chargers from "./Chargers";
import PPSes from "./PPSes";

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
    var menuItems = [
      ["fa-charging-station", Chargers],
      ["fa-archive", PPSes],
      ["fa-chevron-up", undefined]
    ];
    var DataToShow = menuItems[activeIdx][1];
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
            menuItems={menuItems.map(([name], idx) => ({
              name,
              isActive: activeIdx === idx,
              onClick: () => this.setState({ activeIdx: idx })
            }))}
          />
          {DataToShow ? <DataToShow /> : ""}
        </div>
        <small id="version-text">
          {process.env.REACT_APP_VERSION || "unknown version"}
        </small>
      </nav>
    );
  }
}

export default Sidebar;
