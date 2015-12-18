'use strict';

require('babel-polyfill');
const React = require('react');
const ReactDOM = require('react-dom');
const {
  Locations,
  Location
} = require('react-router-component');

/* custom components */
const NavBar = require('./navbar');
const ToolBar = require('./toolbar');
const Home = require('./home');
const Login = require('./login');
const Classes = require('./classes');
const Orders = require('./orders');

class Daypasses extends React.Component {
  render () {
    return (
      <div>
        Daypasses
      </div>
    );
  }
}

class App extends React.Component {
  render () {
    return (
      <div>
        <NavBar />
        <ToolBar />
        <Locations>
          <Location path="/orders"    handler={Orders} />
          <Location path="/classes"   handler={Classes} />
          <Location path="/daypasses" handler={Daypasses} />
          <Location path="/home"      handler={Home} />
          <Location path="/"          handler={Orders} />
          <Location path="/login"     handler={Login} />
        </Locations>
      </div>
    );
  }
}

(function () {
  ReactDOM.render(
    <App />,
    document.getElementById('root-container'));
})();
