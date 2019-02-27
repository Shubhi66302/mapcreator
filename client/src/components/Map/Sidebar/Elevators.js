import React from "react";
import { connect } from "react-redux";
import BaseCard from "./BaseCard";
import { getParticularEntity } from "utils/selectors";
import { tupleOfIntegersToCoordinateKey } from "utils/util";
import EditEntryOrExitPoints from "../Forms/EditEntryOrExitPoints";
import EditElevatorCoordinates from "../Forms/EditElevatorCoordinates";
import {
  editEntryPoints,
  editExitPoints,
  editElevatorCoordinates,
  removeElevator
} from "actions/elevator";
import RemoveItemForm from "../Forms/RemoveItemForm";

const CardEntry = ({ header, value }) => (
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
      ? barcodes.map(({ barcode, floor_id }, idx) => (
        <li key={idx}>
          {barcode} [{floor_id}]
        </li>
      ))
      : "[none]"}
  </ul>
);

const Elevators = ({ elevatorDict, floorIds, dispatch }) => {
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
              <CardEntry header="Elevator ID" value={elevator_id} />
              <CardEntry header="Position" value={position} />
              <CardEntry header="Type" value={type} />
              <CardEntry
                header="Coordinates"
                value={
                  <EditElevatorCoordinates
                    elevator_id={elevator_id}
                    coordinate_list={coordinate_list}
                    onSubmit={formValues =>
                      dispatch(editElevatorCoordinates(formValues))
                    }
                  />
                }
              />
              <ul>
                {coordinate_list.map(({ coordinate }, idx) => (
                  <li key={idx}>
                    {tupleOfIntegersToCoordinateKey(coordinate)}
                  </li>
                ))}
              </ul>
              <CardEntry
                header="Entry Barcodes"
                value={
                  <EditEntryOrExitPoints
                    elevator_id={elevator_id}
                    barcodes={entry_barcodes}
                    barcodesFieldName="entry_barcodes"
                    barcodesFieldLabel="Entry Barcodes"
                    floorIds={floorIds}
                    onSubmit={formValues =>
                      dispatch(editEntryPoints(formValues))
                    }
                  />
                }
              />
              <BarcodeList barcodes={entry_barcodes} />
              <CardEntry
                header="Exit Barcodes"
                value={
                  <EditEntryOrExitPoints
                    elevator_id={elevator_id}
                    barcodes={exit_barcodes}
                    barcodesFieldName="exit_barcodes"
                    barcodesFieldLabel="Exit Barcodes"
                    floorIds={floorIds}
                    onSubmit={formValues =>
                      dispatch(editExitPoints(formValues))
                    }
                  />
                }
              />
              <CardEntry
                header="Delete Elevator"
                value={
                  <RemoveItemForm
                    itemName="Elevator"
                    itemId={elevator_id}
                    onSubmit={() => dispatch(removeElevator({elevator_id}))
                    }
                  />
                }
              />
            </div>
          </BaseCard>
        )
      )}
    </div>
  );
};

export default connect(state => ({
  elevatorDict: getParticularEntity(state, { entityName: "elevator" }),
  floorIds: state.normalizedMap.entities.map.dummy.floors
}))(Elevators);
