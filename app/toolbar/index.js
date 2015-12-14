const React = require('react');
const ActionButton = require('./action-button');

const SearchBox = React.createClass({
  render: () => <div>Search</div> // place-holder
});

const NotificationCenter = React.createClass({
  render: () => <div>Notifications</div> // ditto
});


class ToolBar extends React.Component {
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
