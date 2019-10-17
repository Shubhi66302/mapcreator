import React from "react";
import ReactTooltip from "react-tooltip";

export default ({ id, children }) => (
  <ReactTooltip id={id} effect="solid" delayShow={1000}>
    <div>{children}</div>
  </ReactTooltip>
);
