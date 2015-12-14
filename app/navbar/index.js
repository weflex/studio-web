const React = require('react');
const Link = require('react-router-component').Link;

class NavBar extends React.Component {
  render () {
    return (
      <ul className='navbar'>
        <li><Link href="/home">Home</Link></li>
        <li><Link href="/orders">Orders</Link></li>
        <li><Link href="/classes">Classes</Link></li>
        <li><Link href="/daypasses">Daypasses</Link></li>
      </ul>
    );
  }
}

module.exports = NavBar;
