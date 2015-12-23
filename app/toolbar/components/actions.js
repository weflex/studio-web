'use strict';
const React = require('react');
const { Link } = require('react-router-component');

export class Actions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      actions: [
        {
          title: '创建新课程',
          path: '/classes/add'
        }
      ]
    };
  }
  updateActions(actions) {
    this.setState({
      actions: actions
    });
  }
  render() {
    return (
      <div className="actions-button">
        {this.state.actions.map((action, index) => {
          const link = typeof action.path !== 'string' ? action.title :
            <Link href={action.path}>{action.title}</Link>;
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