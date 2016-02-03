"use strict";

import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Location, Locations } from 'react-router-component';
import { LaunchScreen } from './views/launcher';

const NavBar = require('./components/navbar');
const ToolBar = require('./components/toolbar');
const Order = require('./views/order');

import './layout/root.css';
import './index.css';

function createViewWithBars (component) {
  return class Page extends React.Component {
    constructor(props) {
      super(props);
      this.pageProps = Object.assign({
        ref: 'main'
      }, props);
      this.state = {
        page: null,
        resource: null,
        // resource states
        width: 100,
        isResourceShown: false
      };
    }
    componentDidMount() {
      const { title, actions, resource } = this.refs.main;
      this.refs.toolbar.setTitle(title);
      this.refs.toolbar.refs.actions.updateActions(actions);
      this.refs.toolbar.refs.actions.setActivity(this);
      this.setState({ resource });
    }
    render() {
      const activity = React.createElement(component, this.pageProps);
      const activityStyle = {
        width: this.state.width + '%'
      };
      const resourceStyle = {
        display: this.state.isResourceShown ? 'inline-block' : 'none',
        width: (100 - this.state.width) + '%'
      };
      return (
        <div>
          <NavBar ref="navbar" />
          <ToolBar ref="toolbar" />
          <div className="main">
            <div className="main-activity" style={activityStyle}>
              {activity}
            </div>
            <div className="main-resource" style={resourceStyle}>
              {this.state.resource}
            </div>
          </div>
        </div>
      );
    }
    toggleResource() {
      if (!this.state.isResourceShown) {
        this.setState({
          width: 85,
          isResourceShown: true
        });
      } else {
        this.setState({
          width: 100,
          isResourceShown: false
        });
      }
    }
  };
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pending: true
    };
  }
  onLauncherFinish() {
    this.setState({pending: false});
  }
  render() {
    if (this.state.pending) {
      return (
        <LaunchScreen 
          onFinish={this.onLauncherFinish.bind(this)}
        />
      );
    }
    const OrderListView = createViewWithBars(Order.List);
    return (
      <Locations>
        <Location path="/"
          handler={OrderListView} />
        <Location path="/order"
          handler={OrderListView} />
        <Location path="/calendar"
          handler={createViewWithBars(require('./views/calendar'))} />
        <Location path="/class/template" 
          handler={createViewWithBars(require('./views/class-template/list'))} />
        <Location path="/class/template/add"
          handler={createViewWithBars(require('./views/class-template/detail'))} />
        <Location path="/class/package"
          handler={createViewWithBars(require('./views/class-package/list'))} />
        <Location path="/class/package/add"
          handler={createViewWithBars(require('./views/class-package/detail'))} />
        <Location path="/membership"
          handler={createViewWithBars(require('./views/membership/list'))} />
        <Location path="/venue/settings"
          handler={createViewWithBars(require('./views/venue/settings'))} />
      </Locations>
    );
  }
}

(function () {
  ReactDOM.render(
    <App />,
    document.getElementById('root-container'));
})();
