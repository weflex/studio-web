"use strict";

import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-component';
import UIFramework from 'weflex-ui';
import { client } from '../../api';
import './index.css';
const qstringify = require('qstringify');

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
    const href = '/order/' + qstringify({
      classBefore: moment().add(1, 'day').format('YYYY-MM-DD'),
      classAfter: moment().format('YYYY-MM-DD'),
      orderStatus: this.props.type
    });
    return (
      <div className='data-item' style={{backgroundColor}}>
        <Link href={href}>
          <div className='value'>
            {this.props.value}
          </div>
          <div className='hint'>
            {this.props.hint}
          </div>
        </Link>
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
      stats: {
        paid: [],
        cancel: [],
        checkin: [],
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
    const venue = await client.user.getVenueById();
    const templates = await client.classTemplate.list({
      where: {
        venueId: venue.id,
      },
    });
    const classes = await client.class.list({
      where: {
        templateId: {
          inq: _.map(templates, 'id'),
        },
        date: {
          gt: +moment().startOf('day').toDate(),
          lt: +moment().endOf('day').toDate(),
        },
      },
      include: [
        {
          orders: ['history']
        },
      ],
    });
    const stats = {
      paid: [],
      cancel: [],
      checkin: [],
    };
    classes.filter((clazz) => {
      const {hour, minute} = clazz.from;
      const classBegins = moment(clazz.date).hour(hour).minute(minute);
      return (classBegins.isBefore(moment().endOf('day')) &&
              classBegins.isAfter(moment().startOf('day')));
    }).forEach((item) => {
      item.orders.forEach((order) => {
        if (order.cancelledAt) {
          return stats.cancel.push(order);
        }
        if (order.checkedInAt) {
          return stats.checkin.push(order);
        }
        if (order.createdAt) {
          return stats.paid.push(order);
        }
      });
    });
    this.setState({
      user,
      stats: {
        paid: stats.paid || [],
        cancel: stats.cancel || [],
        checkin: stats.checkin || [],
      },
      venue,
      venues: client.user.venues
    });
  }
  onMouseOver() {
    this.setState({
      showOrgPanel: true
    });
  }
  onMouseLeave() {
    this.setState({
      showOrgPanel: false
    });
  }
  onLogout(event) {
    event.preventDefault();
    UIFramework.Modal.confirm({
      title: '确认登出吗？',
      content: '确认登出吗？',
      onOk: () => location.href = '/login',
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
          <Link className="useravatar" href="/settings/profile">
            <UIFramework.Image circle={true} src={this.state.user.avatar} size={50} />
          </Link>
          <div className="username">
            <span>
              <Link href="/settings/profile">{this.state.user.nickname}</Link>
            </span>
            <a href="#" onClick={this.onLogout.bind(this)}>登出</a>
          </div>
          <DataItem value={this.state.stats.paid.length} hint="今日课程报名" type="signup" />
          <DataItem value={this.state.stats.cancel.length} hint="今日课程取消" type="cancel" />
          <DataItem value={this.state.stats.checkin.length} hint="今日课程签到" type="checkin" />
        </li>
        <NavItem location="/calendar"         hint="课程日历"  icon="calendar" />
        <NavItem location="/order"            hint="订单管理"  icon="inbox" />
        <NavItem location="/class/template"   hint="课程模板"  icon="star" />
        <NavItem location="/class/package"    hint="卡种管理"  icon="heart" />
        <NavItem location="/member"           hint="会员管理"  icon="customer" />
        <NavItem location="/settings"         hint="我的设置"  icon="setting" />
      </ul>
    );
  }
}

module.exports = NavBar;
