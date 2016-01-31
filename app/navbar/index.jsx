const React = require('react');
const Link = require('react-router-component').Link;
const gian = require('@weflex/gian');
const client = require('@weflex/gian').getClient('dev');

require('./index.css');
require('../layout/font.css');

class NavItem extends React.Component {
  get iconfont () {
    return 'icon-font icon-' + this.props.icon;
  }
  render () {
    let activeMarker = null;
    let activeClass = 'navitem';
    if (location.pathname === this.props.location) {
      activeMarker = <span className="active-marker"></span>;
      activeClass += ' active';
    }
    return (
      <li className={activeClass}>
        <Link href={this.props.location}>
          <span className={this.iconfont}></span>
          <span className='ref-text'>{this.props.hint}</span>
        </Link>
        {activeMarker}
      </li>
    );
  }
}

class DataItem extends React.Component {
  render () {
    const bgColors = {
      signup:  '#80C7E8',
      cancel:  '#FF8AC2',
      checkin: '#6ED4A4'
    };
    var backgroundColor = bgColors[this.props.type];
    return (
      <div className='data-item' style={{backgroundColor}}>
        <div className='value'>
          {this.props.value}
        </div>
        <div className='hint'>
          {this.props.hint}
        </div>
      </div>
    );
  }
}

class NavBar extends React.Component {
  constructor () {
    super();
    this.state = {
      user: {
        nickname: '未登陆',
        avatarUrl: 'http://wx.qlogo.cn/mmopen/ajNVdqHZLLDfNbJqbWG9S38aGHQWa4Y6K7Nl3NOmBsSZId2tFs1Iqz7mjU3q1P9LghSuDE8fMYSqIib8533KTSA/0'
      }
    };
  }
  async componentDidMount () {
    var user = await client.user.getCurrent();
    this.setState({user});
  }
  render () {
    return (
      <ul className="navbar">
        <li className="stats">
          <div className="studio-name">WeFlex</div>
          <div className="useravatar">
            <img src={this.state.user.avatarUrl} />
          </div>
          <div className="username">
            <span>
              <a href="#">{this.state.user.nickname}</a>
            </span>
            <a href="/login">登出</a>
          </div>
          <DataItem value="8"  hint="今日课程报名" type="signup" />
          <DataItem value="5"  hint="今日课程取消" type="cancel" />
          <DataItem value="10" hint="今日课程签到" type="checkin" />
        </li>
        <NavItem location="/calendar"         hint="课程日历"  icon="calendar" />
        <NavItem location="/class/template"   hint="课程模板"  icon="star" />
        <NavItem location="/class/package"    hint="卡种管理"  icon="heart" />
        <NavItem location="/membership"       hint="用户管理"  icon="user" />
        <NavItem location="/order"            hint="订单管理"  icon="inbox" />
        <NavItem location="/settings"         hint="场馆设置"  icon="settings" />
        <NavItem location="/docs"             hint="帮助文档"  icon="note" />
      </ul>
    );
  }
}

module.exports = NavBar;
