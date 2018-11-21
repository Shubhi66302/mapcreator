import _ from "lodash";

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
  }
  }
  return state;
};
