const React = require('react');
const { Actions      } = require('./components/actions');
const { SearchInput  } = require('./components/search');
const { Notifier     } = require('./components/notifier');

require('./index.css');

class ToolBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: null
    };
  }
  setTitle(title: string) {
    this.setState({title});
  }
  render() {
    return (
      <div className="toolbar">
        <div className="title">{this.state.title}</div>
        <ul className="toolbox">
          <li className ="searchbox">
            <SearchInput ref="searchInput" name={this.state.title} />
          </li>
          <li>
            <Actions ref="actions" />
          </li>
        </ul>
      </div>
    );
  }
}

module.exports = ToolBar;
