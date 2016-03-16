"use strict";

import _ from 'lodash';
import React from 'react';
import {
  Form,
  Row,
  DateInput,
  TextInput,
  TextButton,
  OptionsPicker,
} from '../../../components/form';
import { client } from '../../../api';
import './invite-trainer.css';

class InviteTrainerView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {
        fullname: {},
        phone: null,
        language: null,
        description: null,
        venueId: null,
      },
      venues: client.user.venues,
    };
  }
  async onSubmit() {
    try {
      await client.middleware('/transaction/invite/trainer', {
        orgId: client.user.org.id,
        venueId: this.state.form.venueId,
        phone: this.state.form.phone,
        fullname: this.state.form.fullname,
        languages: [this.state.form.language],
        description: this.state.form.description,
      }, 'post');
      if (typeof this.props.onComplete === 'function') {
        this.props.onComplete();
      }
    } catch (err) {
      alert(err.message);
    }
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
    }, [
      {
        text: '所有场馆',
        value: undefined,
      }
    ]);
    return (
      <Form className="settings-invite-trainer">
        <Row name="手机号码" hint="教练的手机号码">
          <TextInput
            bindStateCtx={this}
            bindStateName="form.phone"
            placeholder="11位手机号码"
          />
        </Row>
        <Row name="教练姓名" hint="教练的名字">
          <TextInput
            flex={0.5}
            bindStateCtx={this}
            bindStateName="form.fullname.first"
            placeholder="名"
          />
          <TextInput
            flex={0.5}
            bindStateCtx={this}
            bindStateName="form.fullname.last"
            placeholder="姓"
          />
        </Row>
        <Row name="语言" hint="教练的常用语言">
          <OptionsPicker
            bindStateCtx={this}
            bindStateName="form.language"
            options={[
              {text: '中文', value: 'zh'},
              {text: 'English', value: 'en'},
            ]}
          />
        </Row>
        <Row name="所属场馆" hint="教练工作的场馆">
          <OptionsPicker
            bindStateCtx={this}
            bindStateName="form.venueId"
            options={venueOptions}
          />
        </Row>
        <Row name="个人简介" hint="教练的个人简介">
          <TextInput
            bindStateCtx={this}
            bindStateName="form.description"
            multiline={true}
          />
        </Row>
        <Row>
          <TextButton text="邀请教练"
            onClick={this.onSubmit.bind(this)} 
            disabled={this.submitDisabled} 
          />
        </Row>
      </Form>
    );
  }
}

module.exports = InviteTrainerView;
