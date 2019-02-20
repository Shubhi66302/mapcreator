import React from "react";
import { connect } from "react-redux";
import BaseCard from "./BaseCard";
import { getParticularEntity } from "utils/selectors";

const PPSes = ({ ppsDict }) => {
  const ppses = Object.entries(ppsDict).map(([, val]) => val);
  return (
    <div className="pt-3">
      <h4 className="menu-title">PPS</h4>
      {ppses.map(
        ({ pps_id, location, pick_direction, queue_barcodes }, idx) => (
          <BaseCard key={idx} title={pps_id}>
            PPS ID: {pps_id} <br />
            Location: {location}
            <br />
            Pick Direction: {pick_direction}
            <br />
            Queue Barcodes:{" "}
            {`${queue_barcodes.length !== 0 ? queue_barcodes : "[none]"}`}
            <br />
          </BaseCard>
        )
      )}
    </div>
  );
};

export default connect(state => ({
  ppsDict: getParticularEntity(state, { entityName: "pps" })
}))(PPSes);
