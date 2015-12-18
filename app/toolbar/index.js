const React = require('react');
const ActionButton = require('./action-button');

class SearchBox extends React.Component {
  constructor () {
    super();
    this.state = {
      searchText: ''
    };
  }
  render () {
    return (
      <div className='search'>
        <div className='search-box'>
          <input type='text' />
          <i className='icon-font icon-search'></i>
        </div>
      </div>
    ); // place-holder
  }
}

class NotificationCenter extends React.Component {
  render () {
    return (
      <div>
        <span>通知</span>
      </div>
    ); // ditto
  }
}

class ToolBar extends React.Component {
  constructor (props) {
    super(props);
  }
  render () {
    return (
      <ul className='toolbar'>
        <li><ActionButton /></li>
        <li><SearchBox /></li>
        <li><NotificationCenter /></li>
      </ul>
    );
  }
}

module.exports = ToolBar;
