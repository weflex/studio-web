"use strict"

import React from 'react';
import {
  UIForm,
  UIRow,
  UITextInput,
  UIFileInput,
  UIButton,
  UILabel,
  UIText,
  UIOptionPicker
} from 'react-ui-form';
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
  checkBanner(file) {
    if (file.type !== 'image/png' &&
      file.type !== 'image/jpg' &&
      file.type !== 'image/jpeg' &&
      file.type !== 'image/gif') {
      let err = new TypeError('image required');
      err.displayMessage = '必须选择图片';
      return err;
    }
    if (file.size > 2*1024*1024) {
      let err = new Error('image size should less than 2M');
      err.displayMessage = '图片大小必须小于2M'
    }
    return null;
  }
  render() {
    return (
      <div className="settings-detail settings-basic">
        <UIForm>
          <UIRow name="组织名称" required={true}>
            <UITextInput 
              bindStateCtx={this}
              bindStateName="org.name"
              value={this.state.org.name} 
            />
          </UIRow>
          <UIRow name="首栏图片" required={true}>
            <UIFileInput
              bindStateCtx={this}
              bindStateName="org.banner"
              checkFile={this.checkBanner.bind(this)}
            />
          </UIRow>
          <UIRow name="经理" required={true}>
            <UITextInput
              value={this.state.owner.display}
              disabled={true}
            />
          </UIRow>
        </UIForm>
      </div>
    );
  }
}

module.exports = Venue;
