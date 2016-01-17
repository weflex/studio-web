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
const Order = require('./order');

require('./layout/root.css');
require('./index.css');

function createViewWithBars (component) {
  return class Page extends React.Component {
    componentDidMount () {
      this.refs.toolbar.setTitle(
        this.refs.main.title
      );
      this.refs.toolbar.refs.actions.updateActions(
        this.refs.main.actions
      );
    }
    render () {
      const props = Object.assign({ref: 'main'}, this.props);
      const main = React.createElement(component, props);
      return (
        <div>
          <NavBar ref="navbar" />
          <ToolBar ref="toolbar" />
          <div className="main">{main}</div>
        </div>
      );
    }
  };
}

class App extends React.Component {
  render () {
    const OrderListView = createViewWithBars(Order.List);
    return (
      <Locations>
        <Location path="/"
          handler={OrderListView} />
        <Location path="/order"
          handler={OrderListView} />
        <Location path="/calendar"
          handler={createViewWithBars(require('./calendar'))} />
        <Location path="/class/template" 
          handler={createViewWithBars(require('./class-template/list'))} />
        <Location path="/class/package"
          handler={createViewWithBars(require('./class-package/list'))} />
        <Location path="/class/package/add"
          handler={createViewWithBars(require('./class-package/detail'))} />
        <Location path="/trainer"
          handler={createViewWithBars(require('./trainer/list'))} />
        <Location path="/membership"
          handler={createViewWithBars(require('./membership/list'))} />
      </Locations>
    );
  }
}

(function () {
  ReactDOM.render(
    <App />,
    document.getElementById('root-container'));
})();
