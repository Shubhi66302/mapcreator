
export default (state = {}, action) => {
  switch (action.type) {
    case "ADD-QUEUE-BARCODES-TO-PPS":
      var current_queue_barcodes = action.value.current_queue_barcodes;
      return {
        ...state,
        [action.value.pps_id]: {
          ...state[action.value.pps_id],
          queue_barcodes: [...action.value.tiles, ...current_queue_barcodes]
        }
      };
    case "DELETE-PPS-QUEUE": {
      return {
        ...state,
        [action.value.pps_id]: {
          ...state[action.value.pps_id],
          queue_barcodes: []
        }
            
      };
    }
  }
  return { ...state };
};