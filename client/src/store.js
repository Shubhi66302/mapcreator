import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";
import reducer from "reducers/reducer";
import { entityMiddleware, floorMiddleware } from "actions/middlewares";
import { dummyState } from "reducers/util";

// using mapObj as source of truth in store. tiles etc. will be derived from it.
const logger = createLogger({
  // options
  // diff: true,
  // do not log drag-move messages
  predicate: (_getState, { type }) => !/DRAG-MOVE/.test(type)
});

let middleware = [thunk, entityMiddleware, floorMiddleware];
if (process.env.NODE_ENV == "development") middleware = [...middleware, logger];

export default createStore(
  reducer,
  dummyState,
  // only do logging in development
  applyMiddleware(...middleware)
);

// this one is mainly for testing
export const configureStore = initState =>
  createStore(reducer, initState, applyMiddleware(...middleware));
