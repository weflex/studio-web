const React = require('React');
const NavBar = require('../navbar');
const ToolBar = require('../toolbar');
const User = require('../api/user');

class Home extends React.Component {
  constructor () {
    super();
    this.state = {
      string: 'Nothing'
    };
  }

  async componentDidMount () {
    let token = await User.login('king', 'iamthekingoftheweflex');
    this.setState({string: JSON.stringify(token)});
  }
  
  render () {
    return (
      <div>
        <NavBar />
        <ToolBar />
        {this.state.string}
      </div>
    );
  }
}

module.exports = Home;
