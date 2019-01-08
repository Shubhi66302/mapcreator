// map entity has 'dummy' as key since there is only one map
export default (state = {}, action) => {
  switch (action.type) {
    case "ADD-FLOOR":
      return {
        ...state,
        dummy: {
          ...state["dummy"],
          floors: [...state["dummy"]["floors"], action.value.floor_id]
        }
      };
  }
  return state;
};
