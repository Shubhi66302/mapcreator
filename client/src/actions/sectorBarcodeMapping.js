import { clearTiles } from "./actions";

export const sectorBarcodeMapping = ({ sector_id }) => (dispatch, getState) => {
  const {
    selection: { mapTiles },
    normalizedMap: { entities }
  } = getState();
  dispatch({
    type: "SECTOR-BARCODE-MAPPING",
    value: {
      sector_id,
      mapTiles,
      entities
    }
  });
  dispatch(clearTiles);
};