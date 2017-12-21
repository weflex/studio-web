import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import ConnectedIntlProvider from './components/ConnectedIntlProvider';

import LoginIndex from './containers/Login';
//import Calendar from './components/views/calendar';

const store = configureStore();

const RouteWithSubRoutes = (route) => (
  <Route path={route.path} render={props => (
    // pass the sub-routes down to keep nesting
    <route.component {...props} routes={route.routes}/>
  )}/>
)

ReactDOM.render(
  <Provider store={store}>
    <ConnectedIntlProvider>
      <BrowserRouter>
        <div>
          <Switch>
            <Route exact path="/login" component={LoginIndex} />
            <Route exact path="/" component={LoginIndex} />
            <Redirect to="/"/>
          </Switch>
        </div>
      </BrowserRouter>
    </ConnectedIntlProvider>
  </Provider>,
  document.getElementById('root-container')
);
