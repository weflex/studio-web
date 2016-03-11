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

function createViewWithBars (component, app) {
  return class Page extends React.Component {
    constructor(props) {
      super(props);
      this.pageProps = Object.assign({
        ref: 'main',
        app: app,
      }, props);
      this.state = {
        page: null,
        resource: null,
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
          <NavBar ref="navbar" app={app} />
          <ToolBar ref="toolbar" app={app} />
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
    this.router = null;
    this.state = {
      pending: true
    };
  }
  onLauncherFinish() {
    this.setState({pending: false});
  }
  setRouter(router) {
    if (router) {
      this.router = router;
      if (window.location.pathname === '/') {
        this.router.navigate('/calendar');
      }
    }
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
      <Locations ref={this.setRouter.bind(this)}>
        <Location path="/(calendar)"
          handler={createViewWithBars(require('./views/calendar'), this)} />
        <Location path="/class/template/add"
          handler={createViewWithBars(require('./views/class-template/detail'), this)} />
        <Location path="/class/template(/*)"
          handler={createViewWithBars(require('./views/class-template/list'), this)} />
        <Location path="/class/package"
          handler={createViewWithBars(require('./views/class-package/list'), this)} />
        <Location path="/class/package/*"
          handler={createViewWithBars(require('./views/class-package/detail'), this)} />
        <Location path="/order(/*)"
          handler={createViewWithBars(require('./views/order/list'), this)} />
        <Location path="/membership(/*)"
          handler={createViewWithBars(require('./views/membership/list'), this)} />
        <Location path="/settings(/*)"
          handler={createViewWithBars(require('./views/settings/index'), this)} />
      </Locations>
    );
  }
}

(function () {
  ReactDOM.render(
    <App />,
    document.getElementById('root-container'));
})();
