export default (state = {}, action) => {
  switch (action.type) {
    case "ASSIGN-STORABLE":
      const selectedTiles = action.value;
      var newState = { ...state };
      for (var tileId of Object.keys(selectedTiles)) {
        newState[tileId] = { ...newState[tileId], store_status: 1 };
      }
      return newState;
  }
  return state;
};
