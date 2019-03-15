import React from "react";
import { connect } from "react-redux";
import BaseCard from "./BaseCard";
import { getParticularEntity } from "utils/selectors";
import {removeCharger} from "actions/charger";
import CardEntry from "./CardEntry";
import RemoveItemForm from "../Forms/RemoveItemForm";

const Chargers = ({ chargerDict, dispatch }) => {
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
            reinit_point_location,
            charger_direction
          },
          idx
        ) => (
          <BaseCard key={idx} title={charger_id}>
            Charger ID: {charger_id} <br />
            Location: {charger_location}
            <br />
            Mode: {mode}
            <br />
            Direction: {charger_direction}
            <br />
            Entry Point: {entry_point_location}
            <br />
            Reinit Point: {reinit_point_location}
            <br />
            <CardEntry
              header="Delete Charger"
              value={
                <RemoveItemForm
                  itemName="Charger"
                  itemId={charger_id}
                  onSubmit={() => dispatch(removeCharger({charger_id}))
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
  chargerDict: getParticularEntity(state, { entityName: "charger" })
}))(Chargers);
