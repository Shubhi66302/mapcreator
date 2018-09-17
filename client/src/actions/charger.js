import {
  getIdsForEntities,
  coordinateKeyToBarcode,
  getNeighbourTiles,
  getNeighbouringBarcodes
} from "utils/util";
import { getCurrentFloorMaxCoordinate } from "utils/selectors";
import { addEntitiesToFloor, clearTiles } from "./actions";
import { CHARGER_DISTANCE } from "constants";
import _ from "lodash";
// exported for testing
export const createNewCharger = (
  { charger_direction },
  charger_id,
  tileId,
  specialTileId
) => ({
  charger_id,
  charger_location: coordinateKeyToBarcode(tileId),
  charger_direction: charger_direction,
  entry_point_location: coordinateKeyToBarcode(specialTileId),
  entry_point_direction: charger_direction,
  reinit_point_location: coordinateKeyToBarcode(specialTileId),
  reinit_point_direction: charger_direction,
  status: "disconnected",
  mode: "manual",
  charger_type: "rectangular_plate_charger"
});

// TODO: test and fixes
// actual charger barcode, entry point special, and barcode in direction of charger direction
export const createAllThreeChargerBarcodes = (
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
    barcode: coordinateKeyToBarcode(specialTileId),
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
  // TODO: some other neighbour changes
  var chargerBarcode = { ...barcodesDict[tileId] };
  chargerBarcode.neighbours[charger_direction][2] = 0;
  chargerBarcode.adjacency = getNeighbouringBarcodes(tileId, barcodesDict).map(
    x => (x ? coordinateKeyToTupleOfIntegers(x.coordinate) : null)
  );
  chargerBarcode.adjacency[charger_direction] = coordinateKeyToTupleOfIntegers(
    specialTileId
  );
  chargerBarcode.size_info[charger_direction] = CHARGER_DISTANCE;

  // entry barcode
  var entryBarcode = { ...barcodesDict[entryTileId] };
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
    chargerBarcode.size_info[charger_direction] -
    3 * CHARGER_DISTANCE;

  // return {[tileId]: chargerBarcode, [specialTileId] : specialBarcode, [entryTileId]: entryBarcode}
  return [chargerBarcode, specialBarcode, entryBarcode];
};

export const addChargers = (formData, state) => {
  const { selectedTiles, currentFloor } = state;
  const existingChargers = state.normalizedMap.entities["charger"] || {};
  const barcodesDict = state.normalizedMap.entities["barcode"] || {};
  const numEntities = Object.keys(selectedTiles).length;
  var charger_ids = getIdsForEntities(numEntities, existingChargers);
  var newBarcodes = [];
  var newChargers = [];
  var [maxx, maxy] = getCurrentFloorMaxCoordinate(state);
  _.zip(charger_ids, selectedTiles).forEach(([charger_id, tileId], idx) => {
    var specialTileId = tupleOfIntegersToCoordinateKey([
      maxx + idx + 1,
      maxy + idx + 1
    ]);
    // newBarcodesDict = {...newBarcodesDict, createAllThreeChargerBarcodes(formData, tileId, specialTileId, barcodesDict)}
    newBarcodes = newBarcodes.concat(
      createAllThreeChargerBarcodes(
        formData,
        tileId,
        specialTileId,
        barcodesDict
      )
    );
    newChargers.append = createNewCharger(
      formData,
      charger_id,
      tileId,
      specialTileId
    );
  });
  // add chargers
  dispatch({
    type: "ADD-MULTIPLE-CHARGER",
    value: newChargers
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
      entities: newChargers.map(charger => charger.charger_id),
      idField: "charger_id"
    })
  );
  // add entities to floor (barcode)
  // TODO: Fix
  dispatch(
    addEntitiesToFloor({
      currentFloor,
      floorKey: "map_values",
      entities: newBarcodes.map(barcode => barcode.coordinate),
      idField: "coordinate"
    })
  );
  return dispatch(clearTiles);
};

// export const createChargerSpecialBarcodes({})
