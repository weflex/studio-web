require('babel-polyfill');
const React = require('react');
const ReactDOM = require('react-dom');
const Router = require('react-router-component');
const Locations = Router.Locations;
const Location = Router.Location;
const Link = Router.Link;
const ToolBar = require('./toolbar');
const Home = require('./home');
const Login = require('./login');
const Orders = require('./orders');

const NavBar = React.createClass({
  render: () =>
    <ul className='navbar'>
      <li><Link href="/home">Home</Link></li>
      <li><Link href="/orders">Orders</Link></li>
      <li><Link href="/classes">Classes</Link></li>
      <li><Link href="/daypasses">Daypasses</Link></li>
    </ul>
});

const Classes = React.createClass({
  render: () =>
    <div>
      <NavBar />
      <ToolBar />
      Classes
    </div>
});

const Daypasses = React.createClass({
  render: () =>
    <div>
      <NavBar />
      <ToolBar />
      Daypasses
    </div>
});

class App extends React.Component {
  render () {
    return (
      <Locations>
        <Location path='/orders'    handler={Orders} />
        <Location path='/classes'   handler={Classes} />
        <Location path='/daypasses' handler={Daypasses} />
        <Location path='/home'      handler={Home} />
        <Location path='/'          handler={Orders} />
        <Location path='/login'     handler={Login} />
      </Locations>
    );
  }
}

(function () {
  ReactDOM.render(
    <App />,
    document.getElementById('root-container'));
})();
