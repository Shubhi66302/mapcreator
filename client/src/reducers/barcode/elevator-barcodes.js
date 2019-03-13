import {
  tupleOfIntegersToCoordinateKey,
  implicitCoordinateKeyToBarcode
} from "utils/util";

// in elevator it is stored as [{coordinate: [10,11], direction: 2}, ..] etc.
// making it ["10,11", ..]
var elevatorCoordinateListConverter = coordinate_list =>
  coordinate_list.map(({ coordinate }) =>
    tupleOfIntegersToCoordinateKey(coordinate)
  );

// exported for testing
export var changeElevatorCoordinates = (
  state,
  elevatorPosition,
  old_coordinate_list,
  coordinate_list
) => {
  var newState = {};
  const oldCoordinates = elevatorCoordinateListConverter(old_coordinate_list);
  // reset barcodes for all old coordinates to their origin value (assumed to be "030.020" for {20,30} etc. )
  oldCoordinates.forEach(coordinate => {
    newState[coordinate] = {
      ...state[coordinate],
      barcode: implicitCoordinateKeyToBarcode(coordinate)
    };
  });
  // make all new barcodes have the same barcode string as elevatorPosition
  const newCoordinates = elevatorCoordinateListConverter(coordinate_list);
  newCoordinates.forEach(coordinate => {
    newState[coordinate] = { ...state[coordinate], barcode: elevatorPosition };
  });
  return { ...state, ...newState };
};

export var addElevator = (state, action) => {
  return changeElevatorCoordinates(
    state,
    action.value.position,
    [],
    action.value.coordinate_list
  );
};

export var editElevatorCoordinates = (state, action) => {
  const {
    old_coordinate_list,
    coordinate_list,
    elevator_position
  } = action.value;
  return changeElevatorCoordinates(
    state,
    elevator_position,
    old_coordinate_list,
    coordinate_list
  );
};
