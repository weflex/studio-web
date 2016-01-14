const React = require('react');
const NavBar = require('../navbar');
const ToolBar = require('../toolbar');
const { user } = require('@weflex/gian').getClient('dev');

class Home extends React.Component {
  constructor () {
    super();
    this.state = {
      string: 'Nothing'
    };
  }

  async componentDidMount () {
    let token = await user.login('king', 'iamthekingoftheweflex');
    this.setState({string: JSON.stringify(token)});
  }
  
  render () {
    return (
      <div>
        {this.state.string}
      </div>
    );
  }
}

module.exports = Home;
