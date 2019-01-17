import React from "react";
import { connect } from "react-redux";
import BaseCard from "./BaseCard";
import { getParticularEntity } from "utils/selectors";
import { tupleOfIntegersToCoordinateKey } from "utils/util";
import EditElevator from "../Forms/EditElevator";
import EditEntryPoints from "../Forms/EditEntryPoints";

const Entry = ({ header, value }) => (
  <div className="row justify-content-between">
    <div className="col-auto">{header}:</div>
    <div className="col-auto">
      <b>{value}</b>
    </div>
  </div>
);

const BarcodeList = ({ barcodes }) => (
  <ul>
    {barcodes.length
      ? barcodes.map((barcode, idx) => <li key={idx}>{barcode}</li>)
      : "[none]"}
  </ul>
);

const Elevators = ({ elevatorDict }) => {
  const elevators = Object.entries(elevatorDict).map(([, val]) => val);
  return (
    <div className="pt-3">
      <h4 className="menu-title">Elevators</h4>
      {elevators.map(
        (
          {
            elevator_id,
            position,
            type,
            coordinate_list,
            entry_barcodes,
            exit_barcodes
          },
          idx
        ) => (
          <BaseCard key={idx} title={elevator_id}>
            <div className="container">
              <Entry header="Elevator ID" value={elevator_id} />
              <Entry header="Position" value={position} />
              <Entry header="Type" value={type} />
              Elevator Coordinates:
              <ul>
                {coordinate_list.map(({ coordinate }, idx) => (
                  <li key={idx}>
                    {tupleOfIntegersToCoordinateKey(coordinate)}
                  </li>
                ))}
              </ul>
              Entry Barcodes: <EditEntryPoints />
              <BarcodeList barcodes={entry_barcodes} />
              Exit Barcodes:
              <BarcodeList barcodes={exit_barcodes} />
              <EditElevator />
            </div>
          </BaseCard>
        )
      )}
    </div>
  );
};

export default connect(state => ({
  elevatorDict: getParticularEntity(state, { entityName: "elevator" })
}))(Elevators);
