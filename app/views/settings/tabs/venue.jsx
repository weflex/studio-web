"use strict"

import React from 'react';
import {
  UIForm,
  UIRow,
  UITextInput,
  UIButton,
} from 'react-ui-form';
import { client } from '../../../api';

class Venue extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      venue: {},
      owner: {}
    };
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
    this.setState({
      venue,
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
  async onSubmit() {
    await client.venue.upsert(this.state.venue);
    location.reload();
  }
  render() {
    return (
      <div className="settings-detail settings-venue">
        <UIForm>
          <UIRow name="场馆名" required={true}>
            <UITextInput 
              bindStateCtx={this}
              bindStateName="venue.name"
              value={this.state.venue.name}
            />
          </UIRow>
          <UIRow name="联系电话" required={true}>
            <UITextInput
              bindStateCtx={this}
              bindStateName="venue.phone"
              value={this.state.venue.phone}
            />
          </UIRow>
          <UIRow name="地址" required={true}>
            <UITextInput
              bindStateCtx={this}
              bindStateName="venue.address"
              value={this.state.venue.address}
            />
          </UIRow>
          <UIRow name="店长" required={true}>
            <UITextInput
              value={this.state.owner.display}
              disabled={true}
            />
          </UIRow>
          <UIRow>
            <UIButton text="保存信息" onClick={this.onSubmit.bind(this)} />
          </UIRow>
        </UIForm>
      </div>
    );
  }
}

module.exports = Venue;
