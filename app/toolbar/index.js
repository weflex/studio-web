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
      <div className='toolbar'>
        <div className='actions'>
          <ActionButton ref="actionButton" />
        </div>

        <ul className='toolbox'>
          <li>
            <Notifier ref="notifier" />
          </li>
          <li>
            <SearchInput ref="searchInput" />
          </li>
        </ul>
      </div>
    );
  }
}

module.exports = ToolBar;
