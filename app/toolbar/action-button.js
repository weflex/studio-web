const React = require('react');
const initialState = { path: 'class', action: 'create' };
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
        <span className='action'>创建新课程</span>
      </div>
    );
  }
}

module.exports = ActionButton;
