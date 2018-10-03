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
export const onlyOneTileSelected = selectedMapTiles =>
  Object.keys(selectedMapTiles).length == 1;

export const hasBarcodeForTile = (selectedMapTiles, barcodes) =>
  barcodes[Object.keys(selectedMapTiles)[0]];

export const getValidEmptyNeighbours = (selectedMapTiles, barcodes) => {
  const coordinate = Object.keys(selectedMapTiles)[0];
  const nbTileIds = getNeighbourTiles(coordinate, barcodes);
  const emptyDirTileIdList = _.zip([0, 1, 2, 3], nbTileIds).filter(
    ([_dir, nbTileId]) => !barcodes[nbTileId] && isValidCoordinateKey(nbTileId)
  );
  return emptyDirTileIdList;
};

const shouldBeDisabled = (selectedMapTiles, barcodes) => {
  return (
    !onlyOneTileSelected(selectedMapTiles) ||
    !hasBarcodeForTile(selectedMapTiles, barcodes) ||
    getValidEmptyNeighbours(selectedMapTiles, barcodes).length == 0
  );
};

// TODO: support negative tile id i.e. when trying to go above 0,0 etc.
// TODO: support adding multiple edges to new barcode
class AddBarcode extends Component {
  render() {
    const { selectedMapTiles, barcodes, onSubmit, onError } = this.props;
    const disabled = shouldBeDisabled(selectedMapTiles, barcodes);
    if (disabled)
      return (
        <BaseForm
          disabled={disabled}
          schema={baseSchema}
          onSubmit={onSubmit}
          buttonText={"Add Barcode"}
        />
      );
    const coordinate = Object.keys(selectedMapTiles)[0];
    const dirStrs = ["top", "right", "bottom", "left"];
    const emptyDirTileIdList = getValidEmptyNeighbours(
      selectedMapTiles,
      barcodes
    );
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
      />
    );
  }
}

export default connect(
  state => ({
    selectedMapTiles: state.selection.mapTiles,
    barcodes: getBarcodes(state)
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {
      dispatch(addNewBarcode(formData));
    }
  })
)(AddBarcode);
