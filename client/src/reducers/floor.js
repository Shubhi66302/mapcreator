import _ from "lodash";
import {implicitBarcodeToCoordinate} from "utils/util";
export default (state = {}, action) => {
  // only handle multiple add action for now..
  switch (action.type) {
    case "ADD-ENTITIES-TO-FLOOR": {
      const { floorKey, currentFloor, ids } = action.value;
      if (state[currentFloor]) {
        return {
          ...state,
          [currentFloor]: {
            ...state[currentFloor],
            [floorKey]: _.union(state[currentFloor][floorKey] || [], ids)
          }
        };
      }
      break;
    }
    case "REMOVE-ENTITIES-FROM-FLOOR": {
      const { floorKey, currentFloor, ids } = action.value;
      if (state[currentFloor]) {
        return {
          ...state,
          [currentFloor]: {
            ...state[currentFloor],
            [floorKey]: _.difference(state[currentFloor][floorKey] || [], ids)
          }
        };
      }
      break;
    }
    case "ADD-FLOOR": {
      const floorData = action.value;
      return {
        ...state,
        [floorData.floor_id]: {
          ...floorData,
          map_values: floorData.map_values.map(barcode => barcode.coordinate)
        }
      };
    }
    case "EDIT-BARCODE": {
      const {coordinate, currentFloor, new_barcode} = action.value;
      var newCoordinate = implicitBarcodeToCoordinate(new_barcode, newCoordinate);
      if (state[currentFloor]) {
        var newMapValues = _.clone(state[currentFloor].map_values);
        var index = _.findIndex(newMapValues, function(elem) { return elem == coordinate; });
        if (index == -1) {
          break;
        }
        newMapValues[index] = newCoordinate;
        return {
          ...state,
          [currentFloor]: {
            ...state[currentFloor],
            "map_values": newMapValues
          }
        };
      }
      break;
    }
  }
  return state;
};
