import {
  getNeighbourTiles,
  implicitCoordinateKeyToBarcode,
  addNeighbourToBarcode
} from "../utils/util";
import {
  getBarcode,
  getTileIdsForDistanceTiles,
  currentFloorBarcodeToCoordinateKeySelector,
  tileToWorldCoordinate,
  getTileSpriteScale,
  barcodeStringToFloorsSelector
} from "utils/selectors";
import { changeFloor } from "./currentFloor";
import {
  getUpdatedAndTransitBarcodes,
  validateTransitBarcodeForm
} from "./add-transit-barcode";
import { addEntitiesToFloor, clearTiles } from "./actions";
import { snapToCoordinate } from "./viewport";
import { setErrorMessage } from "./message";
import {
  DEFAULT_BOT_WITH_RACK_THRESHOLD,
  TILE_SPRITE_WIDTH,
  TILE_SPRITE_HEIGHT
} from "../constants.js";

// TODO: should create a folder "actions/barcode" and move this file
// and "add-transit-barcode.js" in it since this is getting big

const createNewBarcode = ({ coordinate, neighbours, barcode, size_info }) => ({
  barcode,
  coordinate,
  neighbours,
  blocked: false,
  zone: "defzone",
  store_status: 0,
  size_info,
  botid: "null"
});

const addTransitBarcode = formData => (dispatch, getState) => {
  const state = getState();
  const isValidFormData = validateTransitBarcodeForm(formData, state);
  if (isValidFormData != true) {
    const { error } = isValidFormData;
    return dispatch(setErrorMessage(error));
  }
  var [updatedBarcodes, transitBarcode] = getUpdatedAndTransitBarcodes(
    state,
    formData
  );
  // TODO: should do add barcode and add barcode to floor in a single action.
  // i.e. handle "ADD-MULTIPLE-BARCODE" in floor reducer itself.
  // add to barcodes
  dispatch({
    type: "ADD-MULTIPLE-BARCODE",
    value: [...updatedBarcodes, transitBarcode]
  });
  // add to floor
  dispatch(
    addEntitiesToFloor({
      currentFloor: state.currentFloor,
      floorKey: "map_values",
      entities: [transitBarcode],
      idField: "coordinate"
    })
  );
  // clear selection
  dispatch(clearTiles);
  return Promise.resolve();
};

// TODO: (MUST) choose barcode and coordinate which doesn't exit in current map

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
  const {
    selection: { distanceTiles }
  } = globalState;
  const tileIds = getTileIdsForDistanceTiles(
    distanceTiles,
    globalState,
    direction
  );
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

const locateBarcode = barcodeString => async (dispatch, getState) => {
  var state = getState();
  const floors = barcodeStringToFloorsSelector(state, { barcodeString });
  if (!floors.length) {
    return dispatch(setErrorMessage(`Barcode ${barcodeString} not found.`));
  }
  if (!floors.find(floorId => floorId == state.currentFloor)) {
    // barcode is not present on current floor, switch first
    await dispatch(changeFloor(floors[0]));
    // need to get state again! since we will be using it for selectors later
    state = getState();
  }
  const coordinate = currentFloorBarcodeToCoordinateKeySelector(state, {
    barcode: barcodeString
  });
  const renderCoordinate = tileToWorldCoordinate(state, {
    tileId: coordinate
  });
  const { xScale, yScale } = getTileSpriteScale(state, {
    tileId: coordinate,
    spriteIdx: 0
  });
  // 5 times the max of (width, height) of the tile
  // TODO: should fix selectors and make a `getTileDimensions` selector. right now lots of copy paste @amar.c
  return dispatch(
    snapToCoordinate(
      renderCoordinate,
      Math.max(TILE_SPRITE_WIDTH * xScale, TILE_SPRITE_HEIGHT * yScale) * 5
    )
  );
};

export {
  createNewBarcode,
  addNewBarcode,
  removeBarcodes,
  modifyDistanceBetweenBarcodes,
  modifyNeighbours,
  shiftBarcode,
  addTransitBarcode,
  locateBarcode
};
