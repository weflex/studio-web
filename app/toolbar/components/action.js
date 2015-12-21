'use strict';
const React = require('react');
const { Link } = require('react-router-component');
const defaultState = {
  title: '创建新课程',
  action: '/classes/add'
};

export class ActionButton extends React.Component {
  constructor () {
    super();
    this.state = defaultState;
  }
  render () {
    var action = this.state.action;
    var title = this.state.title;
    var button;
    if (typeof action === 'string') {
      button = (
        <span className="action">
          <Link href={action}>{title}</Link>
        </span>
      );
    } else {
      button = (
        <span className="action" onClick={action.bind(this)}>
          {title}
        </span>
      );
    }
    return <div className='action-button'>{button}</div>;
  }
}
