export default (state = {}, action) => {
  switch (action.type) {
   	case "SECTOR-MXU-PREFERENCES": {
      const { formData, entities } = action.value;
      entities.sectorMxUPreferences = formData;
      return { ...state, ...entities.sectorMxUPreferences };
    }
  }
  return state;
};