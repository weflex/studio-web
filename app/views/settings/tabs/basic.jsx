"use strict"

import React from 'react';
import UIFramework from 'weflex-ui';
import { client } from '../../../api';

class Venue extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      venue: {},
      org: {},
      owner: {
        fullname: {}
      }
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
    this.setState({
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
  render() {
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
        </UIFramework>
      </div>
    );
  }
}

module.exports = Venue;
