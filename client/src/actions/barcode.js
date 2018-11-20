import {
  getNeighbourTiles,
  implicitCoordinateKeyToBarcode,
  addNeighbourToBarcode
} from "../utils/util";
import {
  getBarcode,
  currentFloorBotWithRackThreshold,
  currentFloorBotWithoutRackThreshold,
  tileBoundsSelector
} from "utils/selectors";
import { addEntitiesToFloor, clearTiles } from "./actions";

export const createNewBarcode = ({
  coordinate,
  neighbours,
  barcode,
  size_info
}) => ({
  barcode,
  coordinate,
  neighbours,
  blocked: false,
  zone: "defzone",
  store_status: 0,
  size_info,
  bot_id: "null"
});

export const addNewBarcode = formData => (dispatch, getState) => {
  const state = getState();
  const { tileId, direction } = formData;
  const nbTileId = getNeighbourTiles(tileId)[direction];
  // new barcode will be connected to all neighbour barcodes that it has
  const nbNeighboursTileIds = getNeighbourTiles(nbTileId);
  const oldBarcodes = [];
  const nbNeighbourStructure = [];
  const nbSizeInfo = Array(4).fill(currentFloorBotWithRackThreshold(state));
  nbNeighboursTileIds.forEach((nbNbTileId, idx) => {
    const nbNbBarcode = getBarcode(state, { tileId: nbNbTileId });
    if (nbNbBarcode) {
      oldBarcodes.push(
        addNeighbourToBarcode(nbNbBarcode, (idx + 2) % 4, nbTileId)
      );
      nbNeighbourStructure.push([1, 1, 1]);
      nbSizeInfo[idx] = nbNbBarcode.size_info[(idx + 2) % 4];
    } else {
      nbNeighbourStructure.push([0, 0, 0]);
    }
  });
  const newBarcode = createNewBarcode({
    coordinate: nbTileId,
    neighbours: nbNeighbourStructure,
    barcode: implicitCoordinateKeyToBarcode(nbTileId),
    size_info: nbSizeInfo
  });

  // add to barcodes
  dispatch({
    type: "ADD-MULTIPLE-BARCODE",
    value: [...oldBarcodes, newBarcode]
  });
  // add to floor
  dispatch(
    addEntitiesToFloor({
      currentFloor: state.currentFloor,
      floorKey: "map_values",
      entities: [newBarcode],
      idField: "coordinate"
    })
  );
  // clear selection
  dispatch(clearTiles);
  return Promise.resolve();
};

export const removeBarcodes = (dispatch, getState) => {
  const {
    selection: { mapTiles },
    currentFloor
  } = getState();
  // remove from floor
  dispatch({
    type: "REMOVE-ENTITIES-FROM-FLOOR",
    value: {
      currentFloor,
      floorKey: "map_values",
      ids: Object.keys(mapTiles) || []
    }
  });
  // remove barcodes
  dispatch({
    type: "DELETE-BARCODES",
    value: mapTiles || {}
  });
  // clear tiles
  dispatch(clearTiles);
};

export const modifyDistanceBetweenBarcodes = ({ distance }) => (
  dispatch,
  getState
) => {
  const state = getState();
  const {
    selection: { distanceTiles }
  } = state;
  dispatch({
    type: "MODIFY-DISTANCE-BETWEEN-BARCODES",
    value: {
      distance,
      tileBounds: tileBoundsSelector(state),
      distanceTiles,
      botWithRackThreshold: currentFloorBotWithRackThreshold(state),
      botWithoutRackThreshold: currentFloorBotWithoutRackThreshold(state)
    }
  });
  dispatch(clearTiles);
};

export const modifyNeighbours = (tileId, values) => dispatch => {
  dispatch({
    type: "MODIFY-BARCODE-NEIGHBOURS",
    value: {
      tileId,
      values
    }
  });
  dispatch(clearTiles);
};
