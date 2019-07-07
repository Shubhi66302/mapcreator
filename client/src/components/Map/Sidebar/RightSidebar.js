import React, { Component } from "react";
import "./RightSidebar.css";

import AddPPS from "components/Map/Forms/AddPPS";
import AddCharger from "components/Map/Forms/AddCharger";
import AssignDockPoint from "components/Map/Forms/AssignDockPoint";
import ToggleStorable from "components/Map/Forms/ToggleStorable";
import AddQueueBarcode from "components/Map/Forms/AddQueueBarcode";
import AssignZone from "components/Map/Forms/AssignZone";
import AssignODSExcluded from "components/Map/Forms/AssignODSExcluded";
import AssignEmergencyBarcode from "components/Map/Forms/AssignEmergencyBarcode";
import AddBarcode from "components/Map/Forms/AddBarcode";
import AddFloor from "components/Map/Forms/AddFloor";
import RemoveBarcode from "components/Map/Forms/RemoveBarcode";
import ModifyDistanceBwBarcodes from "components/Map/Forms/ModifyDistanceBwBarcodes";
import AddElevator from "components/Map/Forms/AddElevator";
import AddZone from "components/Map/Forms/AddZone";
import EditSpecialBarcode from "components/Map/Forms/EditSpecialBarcodes";
import ShiftBarcode from "components/Map/Forms/ShiftBarcode";
import ReactTooltip from "react-tooltip";
import AddTransitBarcode from "components/Map/Forms/AddTransitBarcode";
import LocateBarcode from "components/Map/Forms/LocateBarcode";

const QueueCheckbox = ({ val, onChange }) => (
  <label
    style={{
      textAlign: "-webkit-center",
      margin: "3% 5% 3% 5%",
      color: "orange"
    }}
  >
    Queue mode:
    <input
      style={{ marginLeft: "10px" }}
      name="queuemode"
      type="checkbox"
      checked={val}
      onChange={onChange}
    />
  </label>
);

const ZoneViewCheckBox = ({ val, onChange }) => (
  <div>
    <ReactTooltip effect="solid" delayShow={1000} />
    <label
      data-tip="See summary tab in sidebar for zone color legend."
      style={{
        textAlign: "-webkit-center",
        margin: "0% 5% 3% 5%",
        color: "orange"
      }}
    >
      Zone View:
      <input
        style={{ marginLeft: "10px" }}
        name="zoneview"
        type="checkbox"
        checked={val}
        onChange={onChange}
      />
    </label>
  </div>
);
class RightSidebar extends Component {
  state = {
    open: false,
    activeIdx: 0
  };

  render() {
    const { queueMode, zoneViewMode, dispatch } = this.props;
    const { open } = this.state;

    return (
      <nav id="rightsidebar" className={open ? "active" : ""}>
        <button
          id="rightsidebar-button"
          className="btn"
          onClick={() => this.setState({ open: !this.state.open })}
        >
          <i className="fa fa-lg fa-bars" />
        </button>
        <div className="menu-data-container">
          <div
            className="row py-1"
            style={{ margin: "0% 5% 0%", marginTop: "0%" }}
          >
            {[
              ToggleStorable,
              AddPPS,
              AddCharger,
              AssignDockPoint,
              AddZone,
              AssignZone,
              AssignODSExcluded,
              AssignEmergencyBarcode,
              AddBarcode,
              RemoveBarcode,
              AddQueueBarcode,
              ModifyDistanceBwBarcodes,
              AddFloor,
              AddElevator,
              EditSpecialBarcode,
              ShiftBarcode,
              AddTransitBarcode
            ].map((Elm, idx) => (
              <div
                key={idx}
                className="pr-1 pt-1"
                style={{ backgroundColor: "#545c64" }}
              >
                <Elm onError={e => this.setState({ e })} />
              </div>
            ))}
          </div>
          <div className="row">
            <div className="col">
              <QueueCheckbox
                val={queueMode}
                onChange={() => dispatch({ type: "TOGGLE-QUEUE-MODE" })}
              />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <ZoneViewCheckBox
                val={zoneViewMode}
                onChange={() => dispatch({ type: "TOGGLE-ZONE-VIEW-MODE" })}
              />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div style={{ margin: "0% 5% 3% 5%" }}>
                <LocateBarcode />
              </div>
            </div>
          </div>
        </div>
        <small id="version-text">
          {process.env.REACT_APP_VERSION || "unknown version"}
        </small>
      </nav>
    );
  }
}

export default RightSidebar;
