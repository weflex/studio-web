'use strict';

const React = require('react');
const { Link } = require('react-router-component');
const defaultState = {
  title: '创建新课程',
  action: '/classes/add'
};

export class ActionButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
  }
  render() {
    const { action, title } = this.state;
    const button = (typeof action === 'string') ? (
      <span className="action">
        <Link href={action}>{title}</Link>
      </span>
    ) : (
      <span className="action" onClick={action.bind(this)}>
        {title}
      </span>
    );
    return <div className='action-button'>{button}</div>;
  }
}
