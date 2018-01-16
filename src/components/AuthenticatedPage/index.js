'use strict';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import LaunchScreen from '../../containers/Launcher';
import NavBar from '../../containers/Navbar';
import ToolBar from '../toolbar';

export function requireAuthentication(Component, app) {

    class AuthenticatedComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        isResourceShown: false,
        resource: null,
        title: '',
        actions: [],
      };
    }
    componentDidMount() {
      const main = this.refs.main;
      const toolbar = this.refs.toolbar;
      const actions = toolbar.refs.actions;
      const search = toolbar.refs.searchInput;
      app.title = toolbar.setTitle.bind(toolbar);
      app.actions = actions.updateActions.bind(actions);
      app.activity = actions.setActivity.bind(actions);
      app.search = search.initAndListen.bind(search);
      // init the title, actions and activity

      app.actions(main.actions);
      if (main.actions === undefined && main.getWrappedInstance()) {
        app.actions(main.getWrappedInstance().actions);
        if (main.getWrappedInstance().constructor.name === "Connect") {
          app.actions(main.getWrappedInstance().getWrappedInstance().actions);
        }
      }
      app.title(main.title);
      if (main.title === undefined && main.getWrappedInstance()) {
        app.title(main.getWrappedInstance().title);
        if (main.getWrappedInstance().constructor.name === "Connect") {
          app.title(main.getWrappedInstance().getWrappedInstance().title);
        }
      }
      app.search(main.search);
      app.activity(this);
      let resource = main.resource;
      if (main.resource === undefined && typeof main.getWrappedInstance === 'function') {
        resource = main.getWrappedInstance().resource;
        if (main.getWrappedInstance().constructor.name === "Connect") {
          resource = main.getWrappedInstance().getWrappedInstance().resource;
        }
      }
      this.setState({
        resource: resource,
      });
    }
    componentWillMount() {
      this.checkAuth();
    }

    componentWillUpdate() {
      this.checkAuth();
    }

    checkAuth() {
      if (!this.props.isAuthenticated) {
        if (this.props.isAuthenticated === false) {
          let redirectAfterLogin = this.props.location.pathname;
          if (!isEmpty(this.props.location.query)) {
            this.context.router.replace(`/login?next=${this.props.location.query.next}`);
          } else {
            this.context.router.push(`/login?next=${redirectAfterLogin}`);
          }
        }
        else if (this.props.isAuthenticated === true) {
          if (!isEmpty(this.props.location.query)) {
            this.context.router.replace(this.props.location.query.next);
          } else {
            this.context.router.replace('calendar');
          }
        }
      }
    }

    render() {
      const activity = React.createElement(Component, Object.assign({
        app,
        ref: 'main'
      }, this.props));
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
  }

  AuthenticatedComponent.propTypes = {
    location: PropTypes.object.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
    routing: PropTypes.object.isRequired
  };

  AuthenticatedComponent.contextTypes = {
    router: PropTypes.object
  };

  const mapStateToProps = (state) => ({
    isAuthenticated: state.auth.isAuthenticated,
    routing: state.routing
  });

  return connect(mapStateToProps)(AuthenticatedComponent);

}
