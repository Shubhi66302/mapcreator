import React from "react";
import ReactTooltip from "react-tooltip";

export default ({ id, children, delayShow = 1000 }) => (
  <ReactTooltip id={id} effect="solid" delayShow={delayShow}>
    <div>{children}</div>
  </ReactTooltip>
);
