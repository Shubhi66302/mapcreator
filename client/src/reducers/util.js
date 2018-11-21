import _ from "lodash";

export const createEntityReducer = (reducerKey, idField) => (
  state = {},
  action
) => {
  switch (action.type) {
  case `ADD-MULTIPLE-${reducerKey}`:
    // assumed id is already present in entities (used for barcode reducer)
    var newEntitiesObj = {};
    let entities = action.value;
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
  case `DELETE-MULTIPLE-${reducerKey}-BY-ID`:
    return _.omit(state, action.value);
  }
  return state;
};
