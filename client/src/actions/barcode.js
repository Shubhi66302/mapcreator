import {
  getNeighbourTiles,
  implicitCoordinateKeyToBarcode,
  addNeighbourToBarcode
} from "../utils/util";
import { getBarcode, getTileIdsForDistanceTiles} from "utils/selectors";
import { addEntitiesToFloor, clearTiles } from "./actions";
import { setErrorMessage } from "./message";
import { DEFAULT_BOT_WITH_RACK_THRESHOLD } from "../constants.js";

const createNewBarcode = ({ coordinate, neighbours, barcode, size_info }) => ({
  barcode,
  coordinate,
  neighbours,
  blocked: false,
  zone: "defzone",
  store_status: 0,
  size_info,
  bot_id: "null"
});

const addNewBarcode = formData => (dispatch, getState) => {
  const state = getState();
  const { tileId, direction } = formData;
  const nbTileId = getNeighbourTiles(tileId)[direction];
  // new barcode will be connected to all neighbour barcodes that it has
  const nbNeighboursTileIds = getNeighbourTiles(nbTileId);
  const oldBarcodes = [];
  const nbNeighbourStructure = [];
  const nbSizeInfo = Array(4).fill(DEFAULT_BOT_WITH_RACK_THRESHOLD);
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

const removeBarcodes = (dispatch, getState) => {
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

const modifyDistanceBetweenBarcodes = ({ distance, direction }) => (
  dispatch,
  getState
) => {
  const globalState = getState();
  const { selection: { distanceTiles } } = globalState;
  const tileIds = getTileIdsForDistanceTiles(distanceTiles, globalState, direction);
  dispatch({
    type: "MODIFY-DISTANCE-BETWEEN-BARCODES",
    value: {
      distance,
      tileIds,
      direction
    }
  });
  dispatch(clearTiles);
};

const modifyNeighbours = (tileId, values) => dispatch => {
  dispatch({
    type: "MODIFY-BARCODE-NEIGHBOURS",
    value: {
      tileId,
      values
    }
  });
  dispatch(clearTiles);
};

const shiftBarcode = ({ tileId, direction, distance }) => dispatch => {
  try {
    return dispatch({
      type: "SHIFT-BARCODE",
      value: {
        tileId,
        direction,
        distance
      }
    });
  } catch (e) {
    return dispatch(setErrorMessage(e.message));
  }
};

export {
  createNewBarcode,
  addNewBarcode,
  removeBarcodes,
  modifyDistanceBetweenBarcodes,
  modifyNeighbours,
  shiftBarcode
};
