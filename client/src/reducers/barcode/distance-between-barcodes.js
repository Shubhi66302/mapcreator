import _ from "lodash";

export const modifyDistanceBetweenBarcodes = (state, action) => {
  // iterate over all rows/cols and modify
  let newState = _.cloneDeep(state);
  var {distance, direction, tileIds} = action.value;
  tileIds.forEach((tileId) => {
    if(state[tileId].size_info[direction] + distance < 1){
      // Negative or 0 size
      throw new Error(`Cannot modify the distance of barcode ${state[tileId].barcode} in direction because that would cause overlap`);
    };
    newState[tileId].size_info[direction] = state[tileId].size_info[direction] + distance;
  });
  return { ...state, ...newState };
};
