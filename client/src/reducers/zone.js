export default (state = {}, action) => {
  switch (action.type) {
    case "ADD-ZONE": {
      const zone = action.value;
      return { ...state, [zone.zone_id]: zone };
    }
  }
  return state;
};
