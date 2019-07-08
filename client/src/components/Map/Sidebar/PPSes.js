import React from "react";
import { connect } from "react-redux";
import BaseCard from "./BaseCard";
import { getParticularEntity } from "utils/selectors";
import { removePps, removePpsQueue } from "actions/pps";
import RemoveItemForm from "../Forms/Util/RemoveItemForm";

const PPSes = ({ ppsDict, dispatch }) => {
  
  const ppses = Object.entries(ppsDict).map(([, val]) => val);
  return (
    <div className="pt-3">
      <h4 className="menu-title">PPS</h4>
      {ppses.map(
        ({ pps_id, location, pick_direction, type, queue_barcodes }, idx) => (
          <BaseCard key={idx} title={pps_id}>
            PPS ID: {pps_id} <br />
            Location: {location}
            <br />
            Pick Direction: {pick_direction}
            <br />
            Type: {type}
            <br />
            Queue Barcodes:{" "}
            {`${queue_barcodes.length !== 0 ? queue_barcodes : "[none]"}`}
            <br />
            <div className="mb-1">
              <RemoveItemForm
                itemName="Pps Queue"
                itemId={pps_id}
                buttonText="Delete PPS Queue"
                onSubmit={() => dispatch(removePpsQueue({ pps_id }))}
                wrapInButtonGroup={false}
              />
            </div>
            <RemoveItemForm
              itemName="Pps"
              itemId={pps_id}
              buttonText="Delete PPS"
              onSubmit={() => dispatch(removePps({ pps_id }))}
              wrapInButtonGroup={false}
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
