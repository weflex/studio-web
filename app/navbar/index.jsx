const React = require('react');
const Link = require('react-router-component').Link;

require('./index.css');
require('../layout/font.css');

class NavItem extends React.Component {
  render () {
    return (
      <li>
        <Link href={this.props.location}>
          <span className={'icon-font icon-' + this.props.icon}></span>
          <span className='ref-text'>{this.props.hint}</span>
        </Link>
      </li>
    );
  }
}


class DataItem extends React.Component {
  render () {
    const bgColors = {
      signup:  '#ff8560',
      cancel:  '#a489d6',
      checkin: '#6bdfc2'
    };
    var backgroundColor = bgColors[this.props.type];
    return (
      <div className='data-item' style={{backgroundColor}}>
        <div className='hint'>
          {this.props.hint}
        </div>
        <div className='value'>
          {this.props.value}
        </div>
      </div>
    );
  }
}

class NavBar extends React.Component {
  render () {
    return (
      <ul className='navbar'>
        <li>
          <Link href='#'>
            <div className='studio-name'>WeFlex</div>
            <div className='username'>Scott</div>
            <span className='icon-font icon-settings'></span>
            <DataItem value='8'  hint='课程登记' type='signup' />
            <DataItem value='5'  hint='课程取消' type='cancel' />
            <DataItem value='10' hint='课程签到' type='checkin' />
          </Link>
        </li>
        <NavItem location='/home'        hint='总览' icon='heart' />
        <NavItem location='/orders'      hint='订单' icon='light-bulb' />
        <NavItem location='/classes'     hint='课程' icon='star' />
        <NavItem location='/memberships' hint='次卡' icon='tag' />
        <NavItem location='/users'       hint='会员' icon='user' />
        <NavItem location='/trainers'    hint='教练' icon='database' />
      </ul>
    );
  }
}

module.exports = NavBar;
