// map entity has 'dummy' as key since there is only one map
export default (state = {}, action) => {
  switch (action.type) {
    case "ADD-FLOOR": {
      return {
        ...state,
        dummy: {
          ...state["dummy"],
          floors: [...state["dummy"]["floors"], action.value.floor_id]
        }
      };
    }
    case "ADD-ELEVATOR": {
      return {
        ...state,
        dummy: {
          ...state["dummy"],
          elevators: [...state["dummy"]["elevators"], action.value.elevator_id]
        }
      };
    }
  }
  return state;
};
