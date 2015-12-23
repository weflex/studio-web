const React = require('react');
const { Actions      } = require('./components/actions');
const { SearchInput  } = require('./components/search');
const { Notifier     } = require('./components/notifier');

require('./index.css');

class ToolBar extends React.Component {
  constructor (props) {
    super(props);
  }
  render () {
    return (
      <div className="toolbar">
        <Actions ref="actions" />
        <ul className="toolbox">
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
