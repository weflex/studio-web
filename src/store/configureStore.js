import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import rootReducer from '../reducers';

export default function configureStore(initialState) {
  // Use redux-logger only in dev mode
  const __DEV__ = 'development';
  const logger = createLogger({
    predicate: () => __DEV__
  });

	const store = createStore(rootReducer, initialState, compose(
    applyMiddleware(thunk, logger)),
    window.devToolsExtension ? window.devToolsExtension() : f => f //add support for Redux dev tools
  );

	if (module.hot) {
  	// Enable Webpack hot module replacement for reducers
  	module.hot.accept('../reducers', () => {
    		const nextRootReducer = require('../reducers');
    		store.replaceReducer(nextRootReducer);
  	});
	}
	return store;
}
