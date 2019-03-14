
export default (state = {}, action) => {
  switch (action.type) {
    case "ADD-QUEUE-BARCODES-TO-PPS":
      return {
        ...state,
        [action.value.pps_id]: {
          ...state[action.value.pps_id],
          queue_barcodes: action.value.tiles
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