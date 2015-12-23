'use strict';
require('babel-polyfill');
const React = require('react');
const ReactDOM = require('react-dom');
const {
  Locations,
  Location
} = require('react-router-component');
const assign = Object.assign || require('object-assign');

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
  return class Page extends React.Component {
    componentDidMount () {
      this.refs.toolbar.refs.actions.updateActions(
        this.refs.main.actions
      );
    }
    render () {
      const props = assign({ref: 'main'}, this.props);
      const main = React.createElement(component, props);
      return (
        <div>
          <NavBar ref="navbar" />
          <ToolBar ref="toolbar" />
          <div style={{
            position: 'absolute',
            left: 150,
            top: 50,
            right: 0,
            bottom: 0,
            zIndex: 100,
            overflowY: 'scroll'
          }}>
            {main}
          </div>
        </div>
      );
    }
  };
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
        <Location path="/login"       handler={Login} />
        <Location path="/"            handler={OrderListView} />
        <Location path="/home"        handler={HomeView} />
        <Location path="/orders"      handler={OrderListView} />
        <Location path="/classes"     handler={ClassListView} />
        <Location path="/classes/add" handler={ClassDetailView} action="add" />
        <Location path="/classes/:id" handler={ClassDetailView} action="view" />
        <Location path="/daypasses"   handler={DaypassListView} />
      </Locations>
    );
  }
}

(function () {
  ReactDOM.render(
    <App />,
    document.getElementById('root-container'));
})();
