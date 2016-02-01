"use strict";

const React = require('react');
const { Link } = require('react-router-component');

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
    return (
      <div className="actions">
        {this.state.actions.map((action, index) => {
          const link = typeof action.path !== 'string' ? action.title :
            <Link href={action.path}>{action.title}</Link>;
          // handle the shorthands for string onclick
          switch (action.onClick) {
            case 'resource.show':
            case 'resources.show':
              action.onClick = () => {
                const activity = this.state.activity;
                activity.toggleResource.call(activity);
              };
              break;
            default:
              // nothing
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
