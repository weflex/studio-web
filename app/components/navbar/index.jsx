"use strict";

import React from 'react';
import { Link } from 'react-router-component';
import { client } from '../../api';

import './index.css';

class NavItem extends React.Component {
  get iconfont () {
    return 'icon-font icon-' + this.props.icon;
  }
  render () {
    let activeMarker = null;
    let activeClass = 'navitem';
    // check if prefixed with props.location
    if (location.pathname.search(this.props.location) === 0) {
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
        avatar: {
          uri: 'http://wx.qlogo.cn/mmopen/ajNVdqHZLLDfNbJqbWG9S38aGHQWa4Y6K7Nl3NOmBsSZId2tFs1Iqz7mjU3q1P9LghSuDE8fMYSqIib8533KTSA/0'
        }
      },
      venue: {
        name: '加载中...'
      },
      venues: [],
      showOrgPanel: false,
    };
  }
  async componentWillMount () {
    const user = await client.user.getCurrent();
    const venue = await client.org.getSelectedVenue();
    this.setState({
      user, 
      venue,
      venues: client.org.venues
    });
  }
  onMouseOver () {
    this.setState({
      showOrgPanel: true
    });
  }
  onMouseLeave () {
    this.setState({
      showOrgPanel: false
    });
  }
  selectVenue (venue) {
    client.org.selectVenue(venue.id);
    location.reload();
  }
  render () {
    let orgPanelClassName = 'studio-org-panel ';
    if (this.state.showOrgPanel) {
      orgPanelClassName += 'active';
    }
    return (
      <ul className="navbar">
        <li className="stats">
          <div className="studio-name" 
            onMouseOver={this.onMouseOver.bind(this)}
            onMouseLeave={this.onMouseLeave.bind(this)}>
            <span className="text">{this.state.venue.name}</span>
            <span className="icon-font icon-down-open"></span>
            <ul className={orgPanelClassName}>
              {this.state.venues.map((item, index) => {
                let isActive, badge;
                if (item.id === this.state.venue.id) {
                  isActive = 'active';
                }
                if (item.notifications && item.notifications.length) {
                  badge = (
                    <span className="badge">
                      {item.notifications.length}
                    </span>
                  );
                }
                return (
                  <li key={index} className={isActive}
                    onClick={this.selectVenue.bind(null, item)}>
                    <span>{item.name}</span>
                    {badge}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="useravatar">
            <img src={this.state.user.avatar.uri} />
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
        <NavItem location="/membership"       hint="用户管理"  icon="customer" />
        <NavItem location="/order"            hint="订单管理"  icon="inbox" />
        <NavItem location="/settings"         hint="场馆设置"  icon="setting" />
        <NavItem location="/docs"             hint="帮助文档"  icon="note" />
      </ul>
    );
  }
}

module.exports = NavBar;
