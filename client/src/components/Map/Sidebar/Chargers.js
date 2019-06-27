import React from "react";
import { connect } from "react-redux";
import BaseCard from "./BaseCard";
import { getParticularEntity } from "utils/selectors";
import { removeCharger } from "actions/charger";
import RemoveItemForm from "../Forms/Util/RemoveItemForm";

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
            charger_direction,
            charger_type
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
            Charger Type: {charger_type}
            <br />
            Entry Point: {entry_point_location}
            <br />
            Reinit Point: {reinit_point_location}
            <br />
            <RemoveItemForm
              itemName="Charger"
              itemId={charger_id}
              onSubmit={() => dispatch(removeCharger({ charger_id }))}
              buttonText="Delete Charger"
              wrapInButtonGroup={false}
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
