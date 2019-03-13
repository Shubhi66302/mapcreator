import _ from "lodash";
import {
  getNeighbouringBarcodes,
  tupleOfIntegersToCoordinateKey,
  implicitBarcodeToCoordinate,
  coordinateKeyToTupleOfIntegers
} from "utils/util";

export var editBarcode = (state, action) => {
  const { coordinate, new_barcode } = action.value;
  if (_.find(state, { barcode: new_barcode }) !== undefined) return state;
  var newState = _.cloneDeep(state);
  var new_coordinate = implicitBarcodeToCoordinate(new_barcode);
  var [oldx, oldy] = coordinateKeyToTupleOfIntegers(coordinate);
  var [newx, newy] = coordinateKeyToTupleOfIntegers(new_coordinate);
  var newCoordinateKey = tupleOfIntegersToCoordinateKey([newx, newy]);
  var allNeighbours = getNeighbouringBarcodes(coordinate, newState);
  for (var indx in allNeighbours) {
    // list of neighbours like {0:null, 1:{store..}...}
    // TODO: there can be unidirectional edges to this barcode which aren't updated currently
    if (allNeighbours[indx]) {
      for (var adj in allNeighbours[indx].adjacency) {
        if (
          allNeighbours[indx].adjacency[adj] &&
          allNeighbours[indx].adjacency[adj][0] == oldx &&
          allNeighbours[indx].adjacency[adj][1] == oldy
        ) {
          allNeighbours[indx].adjacency[adj] = [newx, newy];
        }
      }
    }
  }
  //Lastly update the coordinate value itself.
  newState[newCoordinateKey] = {
    ...state[coordinate],
    coordinate: newCoordinateKey,
    barcode: new_barcode
  };
  delete newState[coordinate];
  return newState;
};
