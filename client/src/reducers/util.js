export const createEntityReducer = (reducerKey, idField) => (
  state = {},
  action
) => {
  switch (action.type) {
    // assuming new entity already has id
    case `ADD-${reducerKey}`:
      const id = action.value[idField];
      return {
        ...state,
        [id]: { ...action.value, [idField]: id }
      };
    case `ADD-MULTIPLE-${reducerKey}`:
      var newEntitiesObj = {};
      const entities = action.value;
      for (var idx = 0; idx < entities.length; idx++) {
        const id = entities[idx][idField];
        newEntitiesObj[id] = {
          ...entities[idx]
        };
      }
      return { ...state, ...newEntitiesObj };
    case `UPDATE-${reducerKey}-BY-ID`:
      return {
        ...state,
        [action.value[idField]]: {
          ...state[action.value[idField]],
          ...action.value
        }
      };
    // assumed id is passed as value on
    case `DELETE-${reducerKey}-BY-ID`:
      const { [action.value]: toDelete_, ...rest } = state;
      return {
        ...rest
      };
  }
  return state;
};
