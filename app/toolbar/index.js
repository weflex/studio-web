const React = require('react');
const { ActionButton } = require('./components/action');
const { SearchInput  } = require('./components/search');
const { Notifier     } = require('./components/notifier');

class ToolBar extends React.Component {
  constructor (props) {
    super(props);
  }
  componentDidMount () {
    console.log(this);
  }
  render () {
    return (
      <ul className='toolbar'>
        <li>
          <ActionButton ref="actionButton" />
        </li>
        <li>
          <SearchInput ref="searchInput" />
        </li>
        <li>
          <Notifier ref="notifier" />
        </li>
      </ul>
    );
  }
}

module.exports = ToolBar;
