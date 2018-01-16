import "babel-polyfill";
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import { Router, browserHistory } from 'react-router';
import ConnectedIntlProvider from './components/ConnectedIntlProvider';
import { syncHistoryWithStore } from 'react-router-redux';
import routes from './util/routes';
import jwt from 'jsonwebtoken';
import { setCurrentUser } from './actions/loginAction';
import { getCurrentUser } from './actions/userAction';
import { configuration } from './constants';

const store = configureStore();

if (localStorage.getItem(configuration.userTokenKey)) {
  store.dispatch(setCurrentUser(localStorage.getItem(configuration.userTokenKey)));
  store.dispatch(getCurrentUser());
}

const history = syncHistoryWithStore(browserHistory, store);

render(
  <Provider store={store}>
    <ConnectedIntlProvider>
      <Router history={history} routes={routes} />
    </ConnectedIntlProvider>
  </Provider>,
  document.getElementById('root-container')
);
