// middleware to make sure coordinate is there for every entity whenever an ADD-MULTIPLE-X action is sent
// if not, action is not processed by reducers
// TODO: add tests
export const entityMiddleware = store => next => action => {
  if (/ADD-MULTIPLE-.*/.test(action.type)) {
    if (!action.value.every(({ coordinate }) => coordinate)) {
      console.warn(
        `coordinate missing in some entry in ${action.type} action, aborting ${
          action.type
        } action.`
      );
      return store.getState();
    }
  }
  return next(action);
};

export const floorMiddleware = store => next => action => {
  if (/ADD-ENTITIES-TO-FLOOR/.test(action.type)) {
    const { floorKey, ids } = action.value;
    if (!ids.every(e => e)) {
      console.warn(
        `id not found for some entity of ${floorKey}, aborting ${
          action.type
        } action.`
      );
      return store.getState();
    }
  }
  return next(action);
};
