export default (state = {}, action) => {
  // only handle multiple add action for now..
  switch (action.type) {
    case "ADD-ENTITIES-TO-FLOOR":
      const { floorKey, currentFloor, ids } = action.value;
      return {
        ...state,
        [currentFloor]: {
          ...state[currentFloor],
          [floorKey]: [...state[currentFloor][floorKey], ...ids]
        }
      };
  }
  return state;
};
