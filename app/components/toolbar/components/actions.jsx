"use strict";

import React from 'react';
import { Link } from 'react-router-component';

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
          const link = typeof action.path !== 'string' ? action.title :
            <Link href={action.path}>{action.title}</Link>;
          // handle the shorthands for string onclick
          switch (action.onClick) {
            case 'resource.show':
            case 'resource.hide':
            case 'resource.toggle':
              action.onClick = sharedCtx.resource.toggle;
              break;
            default:
              // if not a String and be a function, bind the sharedCtx
              if (typeof action.onClick === 'function') {
                action.onClick = action.onClick.bind(null, sharedCtx);
              }
          }
          return (
            <span className="action-button"
              key={index}
              style={action.style}
              onClick={action.onClick}
            >{link}</span>
          );
        })}
      </div>
    );
  }
}
