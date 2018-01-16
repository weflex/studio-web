"use strict";

import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router';
import UIFramework from '@weflex/weflex-ui';
import * as actions from '../../actions';
import './index.css';
import { client } from '../../util/api';
const qstringify = require('qstringify');
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

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
      <li className={activeClass} onClick={this.props.onClick}>
        <Link to={this.props.location} >
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
    const href = '/booking/' + qstringify({
      classBefore: moment().add(1, 'day').format('YYYY-MM-DD'),
      classAfter: moment().format('YYYY-MM-DD'),
      orderStatus: this.props.type
    });
    return (
      <div className='data-item' style={{backgroundColor}}>
        <Link to={href}>
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
  constructor (props, context) {
    super(props, context);
    this.state = {
      user: {
        nickname: props.intl.formatMessage({id: 'studio_web_navbar_default_nickname'}),
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
        name: props.intl.formatMessage({id: 'studio_web_navbar_default_venue'})
      },
      venues: [],
      showOrgPanel: false,
    };
  }
  async componentWillMount () {
    const user = await this.props.userAction.getCurrentUser();
    const venue = await this.props.venueAction.getVenueById();
    const stats = await this.props.venueAction.getVenueStats(venue);
    this.setState({
      user,
      stats,
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
      title: this.props.intl.formatMessage({id: 'studio_web_navbar_modal_confirm_logout_title'}),
      content: this.props.intl.formatMessage({id: 'studio_web_navbar_modal_confirm_logout_content'}),
      okText: this.props.intl.formatMessage({id: 'studio_web_navbar_modal_confirm_logout_ok'}),
      cancelText: this.props.intl.formatMessage({id: 'studio_web_navbar_modal_confirm_logout_cancel'}),
      onOk: () => {
        this.props.logoutAction.logout();
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      },
    });
  }
  async selectVenue (venue) {
    await client.context.setVenueId(venue.id);
    location.reload();
  }
  render () {
    const { intl } = this.props;
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
          <Link className="useravatar" to="/settings/profile">
            <UIFramework.Image circle={true} src={this.state.user.avatar} size={50} />
          </Link>
          <div className="username">
            <span>
              <Link to="/settings/profile">{this.state.user.nickname}</Link>
            </span>
            <a href="#" onClick={this.onLogout.bind(this)}>
              <FormattedMessage id="studio_web_navbar_logout_link"/>
            </a>
          </div>
          <DataItem value={this.state.stats.paid.length}
                    hint={intl.formatMessage({id: 'studio_web_navbar_data_item_registered_today'})}
                    type="signup"
          />
          <DataItem value={this.state.stats.cancel.length}
                    hint={intl.formatMessage({id: 'studio_web_navbar_data_item_cancelled_today'})}
                    type="cancel"
          />
          <DataItem value={this.state.stats.checkin.length}
                    hint={intl.formatMessage({id: 'studio_web_navbar_data_item_checked_in_today'})}
                    type="checkin"
          />
        </li>
        <NavItem location="/calendar"
                 hint={intl.formatMessage({id: 'studio_web_navbar_item_calender_hint'})}
                 icon="calendar"
                 onClick={ ()=>{mixpanel.track( "日历" );} }
        />
        <NavItem location="/booking"
                 hint={intl.formatMessage({id: 'studio_web_navbar_item_booking_hint'})}
                 icon="inbox"
                 onClick={ ()=>{mixpanel.track( "订单" );} }
        />
        <NavItem location="/class/template"
                 hint={intl.formatMessage({id: 'studio_web_navbar_item_class_template_hint'})}
                 icon="star"
                 onClick={ ()=>{mixpanel.track( "课程模板" );} }
        />
        <NavItem location="/class/package"
                 hint={intl.formatMessage({id: 'studio_web_navbar_item_class_package_hint'})}
                 icon="heart"
                 onClick={ ()=>{mixpanel.track( "卡种管理" );} }
        />
        <NavItem location="/member"
                 hint={intl.formatMessage({id: 'studio_web_navbar_item_member_hint'})}
                 icon="customer"
                 onClick={ ()=>{mixpanel.track( "会员" );} }
        />
        <NavItem location="/trainer"
                 hint={intl.formatMessage({id: 'studio_web_navbar_item_trainer_hint'})}
                 icon="idea"
                 onClick={ ()=>{mixpanel.track( "教练" );} }
        />
        <NavItem location="/report"
                 hint={intl.formatMessage({id: 'studio_web_navbar_item_report_hint'})}
                 icon="note"
                 onClick={ ()=>{mixpanel.track( "报表" );} }
        />
        <NavItem location="/settings"
                 hint={intl.formatMessage({id: 'studio_web_navbar_item_settings_hint'})}
                 icon="setting"
                 onClick={ ()=>{mixpanel.track( "设置" );} }
        />
      </ul>
    );
  }
}

NavBar.propTypes = {
  userAction: PropTypes.object.isRequired,
  logoutAction: PropTypes.object.isRequired,
  venueAction: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
}

NavBar.contextTypes = {
  router: PropTypes.object
}

function mapDispatchToProps(dispatch) {
  return {
    userAction: bindActionCreators(actions.userAction, dispatch),
    logoutAction: bindActionCreators(actions.logoutAction, dispatch),
    venueAction: bindActionCreators(actions.venueAction, dispatch),
  }
}

module.exports = injectIntl(connect(null, mapDispatchToProps)(NavBar));
