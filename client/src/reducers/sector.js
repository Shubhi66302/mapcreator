export default (state = {}, action) => {
  switch (action.type) {
    case "ADD-SECTOR": {
      const sector = action.value;
      return { ...state, [sector.sector_id]: sector };
    }
  }
  return state;
};
