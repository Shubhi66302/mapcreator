// map entity has 'dummy' as key since there is only one map
import _ from "lodash";

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
    case "DELETE-ELEVATOR": {
      const elevator_id = action.value.elevator_id;
      var newState = _.clone(state);
      newState.dummy.elevators = newState.dummy.elevators.filter(id => id != elevator_id);
      return newState;
    }
  }
  return state;
};
