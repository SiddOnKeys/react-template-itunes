/**
 * Create the store with dynamic reducers
 */

import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import createReducer from './create-root-reducer';
import { createInjectorsEnhancer } from 'redux-injectors';
import rootSaga from './root-saga';

// redux persist configuration
const persistConfig = {
  version: 1,
  key: 'root',
  storage,
  blacklist: ['router'] // Don't persist router state
};

/**
 * Configure Redux DevTools enhancer
 * @returns {Function} Composed enhancer function
 */
const configureDevTools = () => {
  if (
    process.env.NODE_ENV !== 'production' &&
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ) {
    return window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      trace: true,
      traceLimit: 25
    });
  }
  return compose;
};

/**
 * Configure Saga middleware and monitor
 * @returns {Object} Saga middleware instance
 */
const configureSaga = () => {
  const sagaOptions = {};

  if (process.env.NODE_ENV !== 'production' && typeof window === 'object' && window.__SAGA_MONITOR_EXTENSION__) {
    Object.assign(sagaOptions, { sagaMonitor: window.__SAGA_MONITOR_EXTENSION__ });
  }

  return createSagaMiddleware(sagaOptions);
};

/**
 * Configure store enhancers
 * @param {Function} sagaMiddleware - The saga middleware
 * @param {Function} runSaga - The saga runner function
 * @returns {Array} Array of enhancers
 */
const configureEnhancers = (sagaMiddleware, runSaga) => {
  const middlewares = [sagaMiddleware];
  const enhancers = [applyMiddleware(...middlewares)];

  const injectEnhancer = createInjectorsEnhancer({
    createReducer,
    runSaga
  });

  return [...enhancers, injectEnhancer];
};

/**
 * Create store extensions
 * @param {Object} store - Redux store
 * @param {Function} runSaga - Saga middleware run function
 * @returns {Object} Store with extensions
 */
const createStoreExtensions = (store, runSaga) => ({
  ...store,
  runSaga,
  injectedReducers: {},
  injectedSagas: {}
});

/**
 * Configures and creates the Redux store with middleware, enhancers, and support for hot reloading.
 * It also sets up Redux Saga and the Redux DevTools extension.
 *
 * @param {Object} [initialState={}] - The initial state of the store.
 * @returns {{ store: Object, persistor: Object }} An object containing the Redux store and the persistor for redux-persist.
 */
export default function configureStore(initialState = {}) {
  const persistedReducer = persistReducer(persistConfig, createReducer());
  const sagaMiddleware = configureSaga();
  const composeEnhancers = configureDevTools();
  const enhancers = configureEnhancers(sagaMiddleware, sagaMiddleware.run);

  const store = createStore(persistedReducer, initialState, composeEnhancers(...enhancers));

  const storeWithExtensions = createStoreExtensions(store, sagaMiddleware.run);
  const persistor = persistStore(storeWithExtensions);

  // Run the root saga
  sagaMiddleware.run(rootSaga);

  // Make reducers hot reloadable
  if (module.hot) {
    module.hot.accept('./create-root-reducer', () => {
      storeWithExtensions.replaceReducer(createReducer(storeWithExtensions.injectedReducers));
    });
  }

  return { store: storeWithExtensions, persistor };
}
