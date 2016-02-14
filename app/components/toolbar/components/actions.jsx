"use strict";

import React from 'react';
import { Link } from 'react-router-component';

class Action extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toggled: this.props.toggled || false,
    };
  }
  get onClick() {
    let handler;
    const sharedContext = this.props.sharedContext;
    switch (this.props.onClick) {
      case 'resource.show':
      case 'resource.hide':
      case 'resource.toggle':
        handler = sharedContext.resource.toggle;
      default:
        handler = this.props.onClick;
    }
    return (event) => {
      let toggled = !this.state.toggled;
      this.setState({toggled});
      if (typeof handler === 'function') {
        handler(sharedContext);
      }
    };
  }
  render() {
    let className = 'action-button';
    let title = this.props.title;
    let link;
    if (this.state.toggled) {
      className += ' toggled';
      if (this.props.toggledTitle) {
        title = this.props.toggledTitle;
      }
    }
    if (this.state.toggled && this.props.toggledTitle) {
      title = this.props.toggledTitle;
    } else {
      title = this.props.title;
    }
    if (typeof this.props.path !== 'string') {
      link = title;
    } else {
      link = <Link href={this.props.path}>{title}</Link>;
    }
    return (
      <span className={className}
        key={this.props.index}
        style={this.props.style}
        onClick={this.onClick}
      >{link}</span>
    );
  }
}

export class Actions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      actions: [
        {
          title: '创建新课程',
          path: '/class/add'
        }
      ],
      activity: null
    };
  }
  updateActions(actions) {
    if (Array.isArray(actions)) {
      this.setState({ actions });
    }
  }
  setActivity(activity) {
    this.setState({
      activity
    });
  }
  render() {
    /**
     * `sharedCtx` is used for sharing state between action buttons 
     * in one page lifecycle.
     */
    let sharedCtx = {

      /**
       * @property {Object} resource - the resource panel utils
       */
      resource: {

        /**
         * @property {Boolean} resource.shown - flag if the resource panel is show
         */
        shown: false,

        /**
         * toggle the resource panel
         * @method resource.toggle
         */
        toggle: () => {
          const activity = this.state.activity;
          activity.toggleResource.call(activity);
          sharedCtx.resource.shown = !sharedCtx.resource.shown;
        },

        /**
         * hide the resource panel
         * @method resource.hide
         */
        hide: () => {
          if (sharedCtx.resource.shown) {
            sharedCtx.resource.toggle();
          }
        },

        /**
         * show the resource panel
         * @method resource.show
         */
        show: () => {
          if (!sharedCtx.resource.shown) {
            sharedCtx.resource.toggle();
          }
        }
      },
    };
    return (
      <div className="actions">
        {this.state.actions.map((action, index) => {
          console.log(action, index);
          return (
            <Action key={index} 
              sharedContext={sharedCtx} 
              {...action} 
            />
          );
        })}
      </div>
    );
  }
}
