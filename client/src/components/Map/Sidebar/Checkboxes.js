import React from "react";
import ReactTooltip from "react-tooltip";
import DirectionViewTooltip from "./DirectionViewTooltip";

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

const MultiQueueCheckbox = ({ val, onChange }) => (
  <label
    style={{
      textAlign: "-webkit-center",
      margin: "3% 5% 3% 5%",
      color: "orange"
    }}
  >
    Multi Queue mode:
    <input
      style={{ marginLeft: "10px" }}
      name="multiqueuemode"
      type="checkbox"
      checked={val}
      onChange={onChange}
    />
  </label>
);

const ZoneViewCheckbox = ({ val, onChange }) => (
  <div>
    <ReactTooltip effect="solid" delayShow={100} />
    <label
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
      <i
        className="fa fa-question-circle"
        style={{ marginLeft: "10px", color: "darkgrey" }}
        data-tip="See summary tab in left sidebar for zone color legend."
      />
    </label>
  </div>
);

const DirectionViewCheckbox = ({ val, onChange }) => (
  <div>
    <DirectionViewTooltip />
    <label
      style={{
        textAlign: "-webkit-center",
        margin: "0% 5% 3% 5%",
        color: "orange"
      }}
    >
      Directionality View:
      <input
        style={{ marginLeft: "10px" }}
        name="directionalityview"
        type="checkbox"
        checked={val}
        onChange={onChange}
      />
      <i
        className="fa fa-question-circle"
        style={{ marginLeft: "10px", color: "darkgrey" }}
        data-tip
        data-for="direction-view-tooltip"
      />
    </label>
  </div>
);

export { MultiQueueCheckbox, QueueCheckbox, ZoneViewCheckbox, DirectionViewCheckbox };
