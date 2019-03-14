import React from "react";

const CardEntry = ({ header, value }) => (
  <div className="row justify-content-between">
    <div className="col-auto">{header}:</div>
    <div className="col-auto">
      <b>{value}</b>
    </div>
  </div>
);
export default CardEntry;