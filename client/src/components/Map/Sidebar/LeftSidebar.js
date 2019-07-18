import React, { Component } from "react";
import "./LeftSidebar.css";
import Chargers from "./Chargers";
import PPSes from "./PPSes";
import Elevators from "./Elevators";
import Summary from "./Summary";

var Menu = ({ menuItems }) => (
  <div className="row">
    {menuItems.map(({ name, isActive, onClick }, idx) => (
      <div
        className={`col leftsidebar-icon ${isActive ? "active" : ""}`}
        key={idx}
        onClick={onClick}
      >
        <i className={`fa ${name}`} />
      </div>
    ))}
  </div>
);

class LeftSidebar extends Component {
  state = {
    open: false,
    activeIdx: 0
  };
  render() {
    const { open, activeIdx } = this.state;
    var menuItems = [
      ["fa-bars",Summary],
      ["fa-chevron-up", Elevators],
      ["fa-charging-station", Chargers],
      ["fa-archive", PPSes],
   
    ];
    var DataToShow = menuItems[activeIdx][1];
    return (
      <nav id="leftsidebar" className={open ? "active" : ""}>
        <button
          id="leftsidebar-button"
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

export default LeftSidebar;
