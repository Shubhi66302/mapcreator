export default (state = {}, action) => {
  switch (action.type) {
    case "ADD-SECTOR": {
      var sector = action.value;
      sector.sector_id = sector.sector_id.toString();
      return { ...state, [sector.sector_id]: sector };
    }
  }
  return state;
};
