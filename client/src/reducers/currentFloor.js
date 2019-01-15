export default (state = 1, action) => {
  switch (action.type) {
    case "CLEAR-MAP":
    case "NEW-MAP":
      return 1;
    case "CHANGE-FLOOR": {
      return action.value;
    }
  }
  return state;
};
