export const successMessageReducer = (state = null, action) => {
  switch (action.type) {
    case "SET-SUCCESS-MESSAGE":
      return action.value;
    case "CLEAR-SUCCESS-MESSAGE":
      return null;
  }
  return state;
};

export const errorMessageReducer = (state = null, action) => {
  switch (action.type) {
    case "SET-ERROR-MESSAGE":
      return action.value;
    case "CLEAR-ERROR-MESSAGE":
      return null;
  }
  return state;
};
