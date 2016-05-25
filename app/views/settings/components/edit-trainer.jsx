"use strict";

import _ from 'lodash';
import React from 'react';
import UIFramework from 'weflex-ui';
import { client } from '../../../api';

class EditTrainerView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {
        phone: props.data.user.phone,
        fullname: props.data.fullname || {},
        language: props.data.languages[0],
        venueId: props.data.venueId,
        description: props.data.description,
      },
      venues: client.user.venues,
    };
  }
  async onSubmit() {
    try {
      await client.collaborator.update(this.props.data.id, {
        venueId: this.state.form.venueId,
        phone: this.state.form.phone,
        fullname: this.state.form.fullname,
        languages: [this.state.form.language],
        description: this.state.form.description,
      }, this.props.data.modifiedAt);
      if (typeof this.props.onComplete === 'function') {
        this.props.onComplete();
      }
    } catch (err) {
      console.error(err && err.stack);
      UIFramework.Modal.error({
        title: err.message,
        content: err.stack
      });
    }
  }
  async onDelete() {
    let props = this.props;
    UIFramework.Modal.confirm({
      title: '确认删除教练吗?',
      content: '删除后，你将不能再在课程中添加该教练，以及已经添加的课程也将过期',
      onOk: async () => {
        await client.orgMember.delete(props.data.id);
        if (typeof props.onComplete === 'function') {
          props.onComplete();
        }
      },
    });
  }
  get submitDisabled() {
    return !(this.state.form.fullname.first &&
      this.state.form.fullname.last &&
      this.state.form.phone &&
      this.state.form.phone.length === 11 &&
      this.state.form.language);
  }
  render() {
    const venueOptions = this.state.venues.reduce((options, venue) => {
      options.push({
        text: venue.name,
        value: venue.id,
      });
      return options;
    }, []);
    return (
      <UIFramework className="settings-edit-trainer">
        <UIFramework.Row name="手机号码" hint="教练的手机号码">
          <UIFramework.TextInput 
            flex={1} 
            value={this.state.form.phone} 
            disabled={true} 
          />
        </UIFramework.Row>
        <UIFramework.Row name="教练姓名" hint="教练的名字">
          <UIFramework.TextInput
            flex={0.5}
            bindStateCtx={this}
            bindStateName="form.fullname.first"
            value={this.state.form.fullname.first}
            placeholder="名"
          />
          <UIFramework.TextInput
            flex={0.5}
            bindStateCtx={this}
            bindStateName="form.fullname.last"
            value={this.state.form.fullname.last}
            placeholder="姓"
          />
        </UIFramework.Row>
        <UIFramework.Row name="语言" hint="教练的常用语言">
          <UIFramework.Select
            flex={1}
            bindStateCtx={this}
            bindStateName="form.language"
            value={this.state.form.language}
            options={[
              {text: '中文', value: 'zh'},
              {text: 'English', value: 'en'},
            ]}
          />
        </UIFramework.Row>
        <UIFramework.Row name="所属场馆" hint="教练工作的场馆">
          <UIFramework.Select
            flex={1}
            bindStateCtx={this}
            bindStateName="form.venueId"
            value={this.state.form.venueId}
            options={venueOptions}
          />
        </UIFramework.Row>
        <UIFramework.Row name="个人简介" hint="教练的个人简介">
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="form.description"
            value={this.state.form.description}
            multiline={true}
          />
        </UIFramework.Row>
        <UIFramework.Row>
          <UIFramework.Button text="保存更改"
            onClick={this.onSubmit.bind(this)} 
            disabled={this.submitDisabled} 
          />
          <UIFramework.Button text="删除教练"
            onClick={this.onDelete.bind(this)} 
          />
        </UIFramework.Row>
      </UIFramework>
    );
  }
}

module.exports = EditTrainerView;
