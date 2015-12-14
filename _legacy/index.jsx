const React = require('react');
const ReactDOM = require('react-dom');
const Router = require('react-router-component');
const Locations = Router.Locations;
const Location = Router.Location;
const Link = Router.Link;

const NavBar = React.createClass({
  render: () =>
    <ul>
      <li><Link href="/home">Home</Link></li>
      <li><Link href="/orders">Orders</Link></li>
      <li><Link href="/classes">Classes</Link></li>
      <li><Link href="/daypasses">Daypasses</Link></li>
    </ul>
});

const Home = React.createClass({
  render: () =>
    <div>
      <NavBar />
      Home
    </div>
});

const Orders = React.createClass({
  render: () =>
    <div>
      <NavBar />
      Orders
    </div>
});

const Classes = React.createClass({
  render: () =>
    <div>
      <NavBar />
      Classes
    </div>
});

const Daypasses = React.createClass({
  render: () =>
    <div>
      <NavBar />
      Daypasses
    </div>
});

const App = React.createClass({
  render: () =>
    <Locations>
      <Location path='/orders'    handler={Orders} />
      <Location path='/classes'   handler={Classes} />
      <Location path='/daypasses' handler={Daypasses} />
      <Location path='/home'      handler={Home} />
      <Location path='/'          handler={Home} />
    </Locations>
});

(function () {
  ReactDOM.render(
    <App />,
    document.getElementById('root-container'));
})();
