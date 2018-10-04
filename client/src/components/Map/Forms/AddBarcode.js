import React, { Component } from "react";
import BaseForm from "./BaseForm";
import { connect } from "react-redux";
import {
  getNeighbourTiles,
  implicitCoordinateKeyToBarcode,
  isValidCoordinateKey
} from "utils/util";
import _ from "lodash";
import { addNewBarcode } from "actions/barcode";
import { getBarcodes } from "../../../utils/selectors";
import titleCase from "title-case";

const baseSchema = {
  title: "Add Barcode",
  type: "object"
};

// exported for testing
export const onlyOneTileSelected = selectedTiles =>
  Object.keys(selectedTiles).length == 1;

export const hasBarcodeForTile = (selectedTiles, barcodes) =>
  barcodes[Object.keys(selectedTiles)[0]];

export const getValidEmptyNeighbours = (selectedTiles, barcodes) => {
  const coordinate = Object.keys(selectedTiles)[0];
  const nbTileIds = getNeighbourTiles(coordinate, barcodes);
  const emptyDirTileIdList = _.zip([0, 1, 2, 3], nbTileIds).filter(
    ([_dir, nbTileId]) => !barcodes[nbTileId] && isValidCoordinateKey(nbTileId)
  );
  return emptyDirTileIdList;
};

const shouldBeDisabled = (selectedTiles, barcodes) => {
  return (
    !onlyOneTileSelected(selectedTiles) ||
    !hasBarcodeForTile(selectedTiles, barcodes) ||
    getValidEmptyNeighbours(selectedTiles, barcodes).length == 0
  );
};

// TODO: support negative tile id i.e. when trying to go above 0,0 etc.
// TODO: support customizing edges of new barcode
class AddBarcode extends Component {
  render() {
    const { selectedTiles, barcodes, onSubmit, onError } = this.props;
    const disabled = shouldBeDisabled(selectedTiles, barcodes);
    const tooltipData = {
      id: "add-barcode",
      title: "Add a barcode",
      bulletPoints: [
        "Can only add one barcode at a time.",
        "Barcodes can only be added at peripheries.",
        "Negative coordinates are not supported, so can't add barcode which might result in negative coordinate."
      ]
    };
    if (disabled)
      return (
        <BaseForm
          disabled={disabled}
          schema={baseSchema}
          onSubmit={onSubmit}
          buttonText={"Add Barcode"}
          tooltipId={"add-barcode"}
          tooltipData={tooltipData}
        />
      );
    const coordinate = Object.keys(selectedTiles)[0];
    const dirStrs = ["top", "right", "bottom", "left"];
    const emptyDirTileIdList = getValidEmptyNeighbours(selectedTiles, barcodes);
    const keys = _.unzip(emptyDirTileIdList)[0];
    const schema = {
      ...baseSchema,
      required: ["direction", "tileId"],
      properties: {
        direction: {
          type: "integer",
          title: "Direction",
          enum: keys,
          enumNames: emptyDirTileIdList.map(
            ([dir, tileId]) =>
              `${titleCase(dirStrs[dir])} (${implicitCoordinateKeyToBarcode(
                tileId
              )})`
          ),
          default: keys[0]
        },
        tileId: {
          type: "string",
          default: coordinate
        }
      }
    };
    const uiSchema = {
      tileId: { "ui:widget": "hidden" }
    };
    return (
      <BaseForm
        disabled={disabled}
        schema={schema}
        onSubmit={onSubmit}
        buttonText={"Add Barcode"}
        uiSchema={uiSchema}
        tooltipData={tooltipData}
      />
    );
  }
}

export default connect(
  state => ({
    selectedTiles: state.selectedTiles,
    barcodes: getBarcodes(state)
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(addNewBarcode(formData));
    }
  })
)(AddBarcode);
