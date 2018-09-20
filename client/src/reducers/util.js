import _ from "lodash";

export const createEntityReducer = (
  reducerKey,
  idField,
  transformUsingId = e => e
) => (state = {}, action) => {
  switch (action.type) {
    case `ADD-MULTIPLE-${reducerKey}`:
      var newEntitiesObj = {};
      let entities = action.value;
      // assign id to new entities, use same ids for entities that already existed and are being updated
      var nextId =
        Object.keys(state).reduce((prev, key) => Math.max(prev, key), 0) + 1;
      for (var idx = 0; idx < entities.length; idx++) {
        const entity = entities[idx];
        // entity already exists if coordinate is same as of an existing entity.
        const id =
          parseInt(_.findKey(state, { coordinate: entity.coordinate })) ||
          nextId++;
        newEntitiesObj[id] = transformUsingId({
          ...entity,
          [idField]: id
        });
      }
      return { ...state, ...newEntitiesObj };
    // TODO: why does declaring entities again give duplicate declaration error?
    case `ADD-MULTIPLE-${reducerKey}-WITH-ID`:
      // assumed id is already present in entities (used for barcode reducer)
      var newEntitiesObj = {};
      let entities2 = action.value;
      for (var idx = 0; idx < entities2.length; idx++) {
        const id = entities2[idx][idField];
        newEntitiesObj[id] = {
          ...entities2[idx]
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
