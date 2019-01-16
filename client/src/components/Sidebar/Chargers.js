import React from "react";
import { connect } from "react-redux";
import BaseCard from "./BaseCard";
import { getParticularEntity } from "utils/selectors";

const Chargers = ({ chargerDict }) => {
  const chargers = Object.entries(chargerDict).map(([, val]) => val);
  return (
    <div className="pt-3">
      <h4 className="menu-title">Chargers</h4>
      {chargers.map(
        (
          {
            charger_id,
            charger_location,
            mode,
            entry_point_location,
            reinit_point_location
          },
          idx
        ) => (
          <BaseCard key={idx} title={charger_id}>
            Charger ID: {charger_id} <br />
            Location: {charger_location}
            <br />
            Mode: {mode}
            <br />
            Entry Point: {entry_point_location}
            <br />
            Reinit Point: {reinit_point_location}
            <br />
          </BaseCard>
        )
      )}
    </div>
  );
};

export default connect(state => ({
  chargerDict: getParticularEntity(state, { entityName: "charger" })
}))(Chargers);
