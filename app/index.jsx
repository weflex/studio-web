"use strict";

import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { 
  Location, 
  Locations 
} from 'react-router-component';
import { LaunchScreen } from './views/launcher';
import NavBar from './components/navbar';
import ToolBar from './components/toolbar';

import './layout/root.css';
import './layout/keyframes.css';
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
        width: this.state.isResourceShown ? 'calc(100% - 140px)' : '100%'
      };
      const resourceStyle = {
        display: this.state.isResourceShown ? 'inline-block' : 'none',
        width: this.state.isResourceShown ? '140px' : '0px'
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
          isResourceShown: true
        });
      } else {
        this.setState({
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
  componentWillMount() {
    if (window.location.pathname === '/') {
      window.location.pathname = '/calendar';
    }
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
    return (
      <Locations>
        <Location path="/calendar"
          handler={createViewWithBars(require('./views/calendar'))} />
        <Location path="/class/template/add"
          handler={createViewWithBars(require('./views/class-template/detail'))} />
        <Location path="/class/template(/*)"
          handler={createViewWithBars(require('./views/class-template/list'))} />
        <Location path="/class/package"
          handler={createViewWithBars(require('./views/class-package/list'))} />
        <Location path="/class/package/add"
          handler={createViewWithBars(require('./views/class-package/detail'))} />
        <Location path="/order(/*)"
          handler={createViewWithBars(require('./views/order/list'))} />
        <Location path="/membership(/*)"
          handler={createViewWithBars(require('./views/membership/list'))} />
        <Location path="/settings(/*)"
          handler={createViewWithBars(require('./views/settings/index'))} />
      </Locations>
    );
  }
}

(function () {
  ReactDOM.render(
    <App />,
    document.getElementById('root-container'));
})();
