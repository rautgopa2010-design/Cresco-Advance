import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from './reducers';
import setAuthToken from '../utils/setAuthToken';

const store = createStore(rootReducer, applyMiddleware(thunk));

// Set token in headers if exists
let currentState = store.getState();
store.subscribe(() => {
  const previousState = currentState;
  currentState = store.getState();

  if (previousState.auth.token !== currentState.auth.token) {
    const token = currentState.auth.token;
    setAuthToken(token);
  }
});

export default store;
