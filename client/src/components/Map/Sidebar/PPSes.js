import React from "react";
import { connect } from "react-redux";
import BaseCard from "./BaseCard";
import { getParticularEntity } from "utils/selectors";
import { removePps, removePpsQueue } from "actions/pps";
import RemoveItemForm from "../Forms/RemoveItemForm";
import CardEntry from "./CardEntry";

const PPSes = ({ ppsDict, dispatch }) => {
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
            <CardEntry
              header="Delete Pps Queue"
              value={
                <RemoveItemForm
                  itemName="Pps Queue"
                  itemId={pps_id}
                  onSubmit={() => dispatch(removePpsQueue({pps_id}))
                  }
                />
              }
            />
            <CardEntry
              header="Delete Pps"
              value={
                <RemoveItemForm
                  itemName="Pps"
                  itemId={pps_id}
                  onSubmit={() => dispatch(removePps({pps_id}))
                  }
                />
              }
            />
          </BaseCard>
        )
      )}
    </div>
  );
};

export default connect(state => ({
  ppsDict: getParticularEntity(state, { entityName: "pps" })
}))(PPSes);
