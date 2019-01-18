export default (state = {}, action) => {
  switch (action.type) {
    case "EDIT-ELEVATOR-ENTRY-POINTS": {
      const { elevator_id, entry_barcodes } = action.value;
      return {
        ...state,
        [elevator_id]: { ...state[elevator_id], entry_barcodes }
      };
    }
    case "EDIT-ELEVATOR-EXIT-POINTS": {
      const { elevator_id, exit_barcodes } = action.value;
      return {
        ...state,
        [elevator_id]: { ...state[elevator_id], exit_barcodes }
      };
    }
    case "EDIT-ELEVATOR-COORDINATES": {
      const { elevator_id, coordinate_list } = action.value;
      return {
        ...state,
        [elevator_id]: { ...state[elevator_id], coordinate_list }
      };
    }
  }
  return state;
};
