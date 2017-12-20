"use strict"

import React from 'react';
import UIFramework from '@weflex/weflex-ui';
import { client } from '../../../api';
import QRCode from 'qrcode.react';
import { Button } from 'antd';
class Venue extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wechatUrl: '',
      venue: {},
      org: {},
      owner: {
        fullname: {}
      },
      size: 'large',
    };
  }
  async componentWillMount() {
    const venue = await client.user.getVenueById();
    const org = await client.org.get(venue.orgId, {
      include: [
        'banner',
        {
          'members': ['roles']
        }
      ]
    });
    const wechatUrl = 'http://booking.theweflex.com/venues/' + venue.id + '/classes?check-ins'
    this.setState({
      wechatUrl,
      venue,
      org,
      owner: this.getOwner(org.members),
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

  onClick() {
    const canvas = document.querySelector('.Qrcode > canvas');
    window.location.href =canvas.toDataURL()
  }

  render() {
    const size = this.state.size;
    return (
      <div className="settings-detail settings-basic">
        <UIFramework>
          <UIFramework.Row name="组织名称">
            <UIFramework.TextInput
              flex={1}
              bindStateCtx={this}
              bindStateName="org.name"
              value={this.state.org.name}
            />
          </UIFramework.Row>
          <UIFramework.Row name="经理">
            <UIFramework.TextInput
              flex={1}
              value={this.state.owner.display}
              disabled={true}
            />
          </UIFramework.Row>
          <UIFramework.Row name="场馆二维码">
            <div className="Qrcode">
              <QRCode value={this.state.wechatUrl} />
            </div>
          </UIFramework.Row>
          <Button icon="download" size={size} onClick={this.onClick}>下载二维码</Button>
        </UIFramework>
      </div>
    );
  }
}

module.exports = Venue;
