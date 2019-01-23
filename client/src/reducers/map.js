// map entity has 'dummy' as key since there is only one map
const addKey = (state, entity, key) => ({
  ...state,
  dummy: {
    ...state["dummy"],
    [entity]: [...state["dummy"][entity], key]
  }
});

export default (state = {}, action) => {
  switch (action.type) {
    case "ADD-FLOOR": {
      return addKey(state, "floors", action.value.floor_id);
    }
    case "ADD-ELEVATOR": {
      return addKey(state, "elevators", action.value.elevator_id);
    }
    case "ADD-ZONE": {
      return addKey(state, "zones", action.value.zone_id);
    }
  }
  return state;
};
