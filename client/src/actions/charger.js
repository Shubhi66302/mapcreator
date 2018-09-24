import {
  getNeighbourTiles,
  getNeighbouringBarcodes,
  implicitCoordinateKeyToBarcode,
  coordinateKeyToTupleOfIntegers,
  tupleOfIntegersToCoordinateKey
} from "utils/util";
import {
  getCurrentFloorMaxCoordinate,
  coordinateKeyToBarcodeSelector,
  getIdsForNewEntities,
  getNextSpecialCoordinate
} from "utils/selectors";
import { addEntitiesToFloor, clearTiles } from "./actions";
import { CHARGER_DISTANCE } from "../constants";
import _ from "lodash";
// exported for testing
export const createNewCharger = (
  { charger_direction },
  tileId,
  specialTileId,
  state
) => ({
  coordinate: tileId,
  charger_location: coordinateKeyToBarcodeSelector(state, { tileId }),
  charger_direction: charger_direction,
  entry_point_location: implicitCoordinateKeyToBarcode(specialTileId),
  entry_point_direction: charger_direction,
  reinit_point_location: implicitCoordinateKeyToBarcode(specialTileId),
  reinit_point_direction: charger_direction,
  status: "disconnected",
  mode: "manual",
  charger_type: "rectangular_plate_charger"
});

// TODO: test and fixes as explained below
// should also split this into smaller functions
// actual charger barcode, entry point special, barcode in direction of charger direction, and all other neighbours of charger barcode as well
export const createAllChargerBarcodes = (
  { charger_direction },
  tileId,
  specialTileId,
  barcodesDict
) => {
  // check if it's possible to create charger. i.e. if a barcode exists in charger_direction
  if (
    !barcodesDict[tileId].neighbours[charger_direction] ||
    !barcodesDict[tileId].neighbours[charger_direction][0]
  )
    throw new Error(
      `No neighbour for ${tileId} in direction ${charger_direction}`
    );
  var entryTileId = getNeighbourTiles(tileId)[charger_direction];
  // special barcode
  var specialBarcode = {
    store_status: 0,
    zone: "defzone",
    barcode: implicitCoordinateKeyToBarcode(specialTileId),
    botid: "null",
    neighbours: [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
    coordinate: specialTileId,
    blocked: false,
    size_info: [1000, 1000, 1000, 1000],
    adjacency: [null, null, null, null],
    special: true
  };
  specialBarcode.neighbours[charger_direction] = [1, 1, 0];
  specialBarcode.neighbours[(charger_direction + 2) % 4] = [1, 1, 0];
  specialBarcode.adjacency[charger_direction] = coordinateKeyToTupleOfIntegers(
    entryTileId
  );
  specialBarcode.adjacency[
    (charger_direction + 2) % 4
  ] = coordinateKeyToTupleOfIntegers(tileId);
  specialBarcode.size_info[charger_direction] = CHARGER_DISTANCE;
  specialBarcode.size_info[(charger_direction + 2) % 4] = CHARGER_DISTANCE;

  // charger barcode
  // TODO: some other neighbour changes to .neighbours; is this even required though since adjacency will now be used for this?
  var chargerBarcode = _.cloneDeep(barcodesDict[tileId]);
  chargerBarcode.neighbours[charger_direction][2] = 0;
  chargerBarcode.adjacency = getNeighbouringBarcodes(tileId, barcodesDict).map(
    x => (x ? coordinateKeyToTupleOfIntegers(x.coordinate) : null)
  );
  chargerBarcode.adjacency[charger_direction] = coordinateKeyToTupleOfIntegers(
    specialTileId
  );
  var originalChargerBarcodeSizeInfoInChargerDirection =
    chargerBarcode.size_info[charger_direction];
  chargerBarcode.size_info[charger_direction] = CHARGER_DISTANCE;

  // entry barcode
  var entryBarcode = _.cloneDeep(barcodesDict[entryTileId]);
  entryBarcode.neighbours[(charger_direction + 2) % 4][2] = 0;
  entryBarcode.adjacency = getNeighbouringBarcodes(
    entryTileId,
    barcodesDict
  ).map(x => (x ? coordinateKeyToTupleOfIntegers(x.coordinate) : null));
  entryBarcode.adjacency[
    (charger_direction + 2) % 4
  ] = coordinateKeyToTupleOfIntegers(specialTileId);
  entryBarcode.size_info[(charger_direction + 2) % 4] =
    entryBarcode.size_info[(charger_direction + 2) % 4] +
    originalChargerBarcodeSizeInfoInChargerDirection -
    3 * CHARGER_DISTANCE;

  // other neighbour barcodes of charger barcode
  var chargerNeighboursExceptEntry = getNeighbouringBarcodes(
    tileId,
    barcodesDict
  )
    .map((nb, idx) => {
      if (!nb || nb.coordinate == entryTileId) return null;
      var nbClone = _.cloneDeep(nb);
      nbClone.neighbours[(idx + 2) % 4][1] = 0;
      nbClone.neighbours[(idx + 2) % 4][2] = 0;
      return nbClone;
    })
    .filter(e => e != null);

  return [
    ...chargerNeighboursExceptEntry,
    chargerBarcode,
    specialBarcode,
    entryBarcode
  ];
};

export const addChargers = formData => (dispatch, getState) => {
  const state = getState();
  const { selectedTiles, currentFloor } = state;
  const barcodesDict = state.normalizedMap.entities["barcode"] || {};
  var newBarcodes = [];
  var newChargers = [];
  var [maxx, maxy] = getCurrentFloorMaxCoordinate(state);
  Object.keys(selectedTiles).forEach((tileId, idx) => {
    var specialTileId = getNextSpecialCoordinate(state);
    newBarcodes = newBarcodes.concat(
      createAllChargerBarcodes(formData, tileId, specialTileId, barcodesDict)
    );
    newChargers.push(createNewCharger(formData, tileId, specialTileId, state));
  });
  // get ids for chargers
  var ids = getIdsForNewEntities(state, {
    entityName: "charger",
    newEntities: newChargers
  });
  var newChargersWithIds = _.zip(ids, newChargers).map(
    ([charger_id, charger]) => ({
      ...charger,
      charger_id
    })
  );
  // add chargers
  dispatch({
    type: "ADD-MULTIPLE-CHARGER",
    value: newChargersWithIds
  });
  // add barcodes
  dispatch({
    type: "ADD-MULTIPLE-BARCODE",
    value: newBarcodes
  });
  // add entities to floor (charger)
  dispatch(
    addEntitiesToFloor({
      currentFloor,
      floorKey: "chargers",
      entities: newChargersWithIds,
      idField: "charger_id"
    })
  );
  // add entities to floor (barcode)
  dispatch(
    addEntitiesToFloor({
      currentFloor,
      floorKey: "map_values",
      entities: newBarcodes,
      idField: "coordinate"
    })
  );
  return dispatch(clearTiles);
};
