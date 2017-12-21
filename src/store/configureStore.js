import { createStore } from 'redux';
import App from '../reducers';

export default function configureStore(initialState) {
  	const store = createStore(App);
  	if (module.hot) {
    	// Enable Webpack hot module replacement for reducers
    	module.hot.accept('../reducers', () => {
      		const nextRootReducer = require('../reducers');
      		store.replaceReducer(nextRootReducer);
    	});
  	}
  	return store;
}
