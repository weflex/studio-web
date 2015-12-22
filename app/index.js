'use strict';
require('babel-polyfill');
const React = require('react');
const ReactDOM = require('react-dom');
const {
  Locations,
  Location
} = require('react-router-component');

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

function createViewWithBars (component) {
  var context = {
    component: component,
    style: {
      position: 'absolute',
      left: 100,
      top: 50,
      right: 0,
      bottom: 0,
      zIndex: 100,
      overflowY: 'scroll'
    },
    _navbar: null,
    _toolbar: null,
    get navbar () {
      return context._navbar;
    },
    get toolbar () {
      return context._toolbar;
    }
  };
  return (
    <div>
      <NavBar ref={node => {
        if (node && !context._navbar) {
          context._navbar = node;
        }
      }}/>
      <ToolBar ref={node => {
        if (node && !context._toolbar) {
          context._toolbar = node;
        }
      }}/>
      <div style={context.style}>
        <context.component context={context} />
      </div>
    </div>
  );
}

class App extends React.Component {
  render () {
    const LoginView = Login;
    const OrderListView = createViewWithBars(Orders.List);
    const ClassListView = createViewWithBars(Classes.List);
    const ClassDetailView = createViewWithBars(Classes.Detail);
    const DaypassListView = createViewWithBars(Daypasses);
    const HomeView = createViewWithBars(Home);
    return (
      <Locations>
        <Location path="/login"          handler={Login} />
        <Location path="/"               handler={OrderListView} />
        <Location path="/home"           handler={HomeView} />
        <Location path="/orders"         handler={OrderListView} />
        <Location path="/classes"        handler={ClassListView} />
        <Location path="/classes/add"    handler={ClassDetailView} />
        <Location path="/classes/:id"    handler={ClassDetailView} />
        <Location path="/daypasses"      handler={DaypassListView} />
      </Locations>
    );
  }
}

(function () {
  ReactDOM.render(
    <App />,
    document.getElementById('root-container'));
})();
