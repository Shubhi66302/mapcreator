import React, { Component } from "react";
import BaseForm from "./BaseForm";
import { connect } from "react-redux";
import { getNeighbourTiles } from "utils/util";
import _ from "lodash";
import { directionSchema } from "utils/forms";
import { getBarcodes } from "../../../utils/selectors";

const baseSchema = {
  title: "Add Barcode",
  type: "object",
};

// exported for testing
export const onlyOneTileSelected = selectedTiles =>
  Object.keys(selectedTiles).length == 1;

export const hasBarcodeForTile = (selectedTiles, barcodes) =>
  barcodes[Object.keys(selectedTiles)[0]];

export const hasLessThanFourNeighbours = (selectedTiles, barcodes) => {
  const neighbourTileIds = getNeighbourTiles(Object.keys(selectedTiles)[0]);
  return (
    neighbourTileIds.map(tileId => barcodes[tileId]).filter(barcode => barcode)
      .length < 4
  );
};

const shouldBeDisabled = (selectedTiles, barcodes) => {
  return (
    !onlyOneTileSelected(selectedTiles) ||
    !hasBarcodeForTile(selectedTiles, barcodes) ||
    !hasLessThanFourNeighbours(selectedTiles, barcodes)
  );
};

class AddBarcode extends Component {
  render() {
    const { selectedTiles, barcodes, onSubmit, onError } = this.props;
    const disabled = shouldBeDisabled(selectedTiles, barcodes);
    if (disabled)
      return (
        <BaseForm
          disabled={disabled}
          schema={baseSchema}
          onSubmit={onSubmit}
          buttonText={"Add Barcode"}
        />
      );
    
    const schema = {
      ...baseSchema,
      properties: ['top']
    }
  }
}

export default connect(
  state => ({
    selectedTiles: state.selectedTiles,
    barcodes: getBarcodes(state)
  }),
  dispatch => ({
    onSubmit: ({ formData }) => {}
  })
)(AddBarcode);
