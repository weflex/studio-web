"use strict";

import _ from 'lodash';
import React from 'react';
import UIFramework from 'weflex-ui';
import { client } from '../../api';

class TrainerProfile extends React.Component {
  constructor(props) {
    super(props);

    let trainer = Object.assign({}, props.trainer || {fullname: {}});
    this.state = {
      trainer,
      venueId: trainer && trainer.venueId || '',
      orgId: trainer && trainer.orgId || '',
    };

    this.cache = {
      phoneDisable: ( Object.keys(props.trainer) ).length > 0,
    };
  }
  async componentDidMount () {
    const venue = await client.user.getVenueById();
    this.setState({
      venueId: venue.id,
      orgId: venue.orgId,
    });
  } 
  async onSubmit() {
    const isNewInstance = (undefined === this.state.trainer.id);
    const {id, phone, name, description, employmentStatus, modifiedAt} = this.state.trainer;
    try {
      if (isNewInstance) {
        await client.middleware('/transaction/invite/trainer', {
          orgId: client.user.org.id,
          venueId: this.state.venueId,
          phone,
          fullname: {
            first: name,
            last: '',
          },
          employmentStatus,
          description,
        }, 'post');
      } else {
        await client.collaborator.update(id, {
          fullname: {
            first: name,
            last: '',
          },
          employmentStatus,
          description,
        }, modifiedAt);
      }

      if (typeof this.props.onComplete === 'function') {
        this.props.onComplete(this.state.trainer);
      }
    } catch (err) {
      alert(err.message);
    }
  }
  get submitDisabled() {
    return !(this.state.trainer.name &&
      this.state.trainer.employmentStatus &&
      this.state.trainer.phone &&
      this.state.trainer.phone.length === 11);
  }
  render() {
    const trainer = this.state.trainer;
    const isNewInstance = (undefined === trainer.id);
    const employmentStatuses = [
      {
        text: '全职',
        value: 'fulltime',
        key: 1,
      },
      {
        text: '兼职',
        value: 'parttime',
        key: 2,
      },
    ];
    return (
      <UIFramework className="trainer-profile">
        <UIFramework.Row name="手机号码" hint="教练的手机号码">
          <UIFramework.TextInput
            flex={1}
            value={trainer.phone}
            bindStateCtx={this}
            bindStateName="trainer.phone"
            placeholder="11位手机号码"
            disabled={this.cache.phoneDisable}
          />
        </UIFramework.Row>
        <UIFramework.Row name="教练姓名" hint="教练的名字">
          <UIFramework.TextInput
            flex={1}
            value={trainer.name}
            bindStateCtx={this}
            bindStateName="trainer.name"
            placeholder="姓名"
          />
        </UIFramework.Row>
        <UIFramework.Row name="教练类型" hint="全职或兼职">
          <UIFramework.Select
            flex={1}
            value={trainer.employmentStatus}
            bindStateCtx={this}
            bindStateName="trainer.employmentStatus"
            options={employmentStatuses}
            placeholder="类型"
          />
        </UIFramework.Row>
        <UIFramework.Row name="个人简介" hint="教练的个人简介">
          <UIFramework.TextInput
            flex={1}
            value={trainer.description}
            bindStateCtx={this}
            bindStateName="trainer.description"
            multiline={true}
          />
        </UIFramework.Row>
        <UIFramework.Row>
          <UIFramework.Button text="保存"
            onClick={this.onSubmit.bind(this)} 
            disabled={this.submitDisabled} 
          />
        </UIFramework.Row>
      </UIFramework>
    );
  }
}

module.exports = TrainerProfile;