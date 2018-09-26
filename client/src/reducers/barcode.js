import { getNeighbourTiles } from "utils/util";

export default (state = {}, action) => {
  switch (action.type) {
    case "ASSIGN-STORABLE":
      const selectedTiles = action.value;
      var newState = {};
      for (let tileId of Object.keys(selectedTiles)) {
        newState[tileId] = { ...state[tileId], store_status: 1 };
        if (newState[tileId].neighbours) {
          var neighbouringTileIds = getNeighbourTiles(tileId);
          neighbouringTileIds.forEach((neighbouringTileId, idx) => {
            // only get neighbours that have already been added to new state. this
            // reduces redundant updates
            if (newState[neighbouringTileId]) {
              // cannot traverse rack to rack
              newState[neighbouringTileId].neighbours[(idx + 2) % 4][2] = 0;
              newState[tileId].neighbours[idx][2] = 0;
            }
          });
        }
      }
      return Object.assign({}, state, newState);
  }
  return state;
};
