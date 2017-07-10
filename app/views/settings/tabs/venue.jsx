"use strict"

import React from 'react';
import UIFramework from '@weflex/weflex-ui';
import { client } from '../../../api';
import CopyToClipboard from 'react-copy-to-clipboard';

class Venue extends React.Component {
  static style = {
    position: 'relative',
    top: '12px'
  };
  constructor(props) {
    super(props);
    this.state = {
      venue: {},
      owner: {},
      wechatURL: ''
    };
  }
  static defaultProps = {
    MaxDeadline: 200,
    MinDeadline: 0
  }
  async componentWillMount() {
    const venue = await client.user.getVenueById();
    const org = await client.org.get(venue.orgId, {
      include: [
        {
          'members': ['roles']
        },
      ]
    });
    const venueId = await client.user.getVenueById().id;
    this.setState({
      venue,
      owner: this.getOwner(org.members),
      wechatURL: 'http://booking.theweflex.com/venues/' + venueId + '/classes'
    });
  }
  getOwner(members) {
    let owner;
    for (let member of members) {
      for (let role of member.roles) {
        if (role.name === '$owner') {
          owner = member;
          break;
        }
      }
      if (owner) {
        break;
      }
    }
    owner.display = owner.fullname.first + ' ' + owner.fullname.last;
    return owner;
  }
  async onSubmit() {
    let shouldRefresh = false;
    try {
      await client.venue.upsert(this.state.venue);
    } catch (err) {
      if (err.code === 'RESOURCE_EXPIRED') {
      }
    }
    if (!shouldRefresh) {
      location.reload();
    }
  }
  checkoutNumber(event) {
    let keyword = event.target.value
    let MaxDeadline = this.props.MaxDeadline
    let MinDeadline = this.props.MinDeadline
    if (keyword >= MaxDeadline) {
      this.state.venue.deadline = MaxDeadline
    } else if (keyword < MinDeadline) {
      this.state.venue.deadline = MinDeadline
    } else if (keyword >= MinDeadline && keyword <= MaxDeadline) {
      this.state.venue.deadline = keyword
    } else {
      this.state.venue.deadline = MinDeadline
    }
  }
  render() {
    return (
      <div className="settings-detail settings-venue">
        <UIFramework>
          <UIFramework.Row name="场馆名">
            <UIFramework.TextInput
              flex={1}
              bindStateCtx={this}
              bindStateName="venue.name"
              value={this.state.venue.name}
            />
          </UIFramework.Row>
          <UIFramework.Row name="联系电话">
            <UIFramework.TextInput
              flex={1}
              bindStateCtx={this}
              bindStateName="venue.phone"
              value={this.state.venue.phone}
            />
          </UIFramework.Row>
          <UIFramework.Row name="地址">
            <UIFramework.TextInput
              flex={1}
              bindStateCtx={this}
              bindStateName="venue.address"
              value={this.state.venue.address}
            />
          </UIFramework.Row>
          <UIFramework.Row name="店长">
            <UIFramework.TextInput
              flex={1}
              value={this.state.owner.display}
              disabled={true}
            />
          </UIFramework.Row>
          <UIFramework.Row name='最晚预约取消时间'>
            <span style={Venue.style}>课程开始前</span> <UIFramework.TextInput
              flex={0.2}
              bindStateCtx={this}
              bindStateName="venue.deadline"
              value={this.state.venue.deadline}
              onChange={this.checkoutNumber.bind(this)}
            /><span style={Venue.style}>小时</span>
          </UIFramework.Row>
          <UIFramework.Row>
            <UIFramework.Button text="保存信息"
              onClick={this.onSubmit.bind(this)} />
          </UIFramework.Row>
          <UIFramework.Row name="会员订课网址">
            <UIFramework.TextInput
              flex={0.8}
              disabled={true}
              value={this.state.wechatURL} />
            <CopyToClipboard text={this.state.wechatURL}>
              <UIFramework.Button
                text="复制"
                flex={0.2}
                onClick={() => { mixpanel.track("门店：复制"); window.alert("会员订课网址已复制到您的剪贴板") }} />
            </CopyToClipboard>
          </UIFramework.Row>
        </UIFramework>
      </div>
    );
  }
}

module.exports = Venue;
