const React = require('react');
const initialState = { path:'class', action:'create' };
const actions = {
  create: {
    icon: 'create-icon'
  }
};

class ActionButton extends React.Component {
  constructor () {
    super();
    this.state = initialState;
  }
  render () {
    return (
      <div className='action-button'>
        <i className='icon'>{actions[this.state.action].icon}</i>&nbsp;
        <span className='action'>{this.state.action}</span>
      </div>
    );
  }
}

module.exports = ActionButton;
