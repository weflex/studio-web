const React = require('react');
const Link = require('react-router-component').Link;

class NavBar extends React.Component {
  render () {
    return (
      <ul className='navbar'>
        <li><Link href='/home'>
          Studio
        </Link></li>
        <li><Link href='/home'>
          <i className='icon-font icon-star'></i>&nbsp;总览
        </Link></li>
        <li><Link href='/orders'>
          <i className='icon-font icon-inbox'></i>&nbsp;订单
        </Link></li>
        <li><Link href='/classes'>
          <i className='icon-font icon-database'></i>&nbsp;课程
        </Link></li>
        <li><Link href='/daypasses'>
          <i className='icon-font icon-tag'></i>&nbsp;次卡
        </Link></li>
        <li><Link href='/users'>
          <i className='icon-font icon-user'></i>&nbsp;用户
        </Link></li>
      </ul>
    );
  }
}

module.exports = NavBar;
