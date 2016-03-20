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
import './edit-trainer.css';

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
      await client.orgMember.update(this.props.data.id, {
        venueId: this.state.form.venueId,
        phone: this.state.form.phone,
        fullname: this.state.form.fullname,
        languages: [this.state.form.language],
        description: this.state.form.description,
      });
      if (typeof this.props.onComplete === 'function') {
        this.props.onComplete();
      }
    } catch (err) {
      alert(err.message);
    }
  }
  async onDelete() {
    if (confirm('确认删除教练?')) {
      try {
        await client.orgMember.delete(this.props.data.id);
        if (typeof this.props.onComplete === 'function') {
          this.props.onComplete();
        }
      } catch (err) {
        alert(err.message);
      }
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
      <Form className="settings-edit-trainer">
        <Row name="手机号码" hint="教练的手机号码">
          <TextInput defaultValue={this.state.form.phone} disabled={true} />
        </Row>
        <Row name="教练姓名" hint="教练的名字">
          <TextInput
            flex={0.5}
            bindStateCtx={this}
            bindStateName="form.fullname.first"
            value={this.state.form.fullname.first}
            placeholder="名"
          />
          <TextInput
            flex={0.5}
            bindStateCtx={this}
            bindStateName="form.fullname.last"
            value={this.state.form.fullname.last}
            placeholder="姓"
          />
        </Row>
        <Row name="语言" hint="教练的常用语言">
          <OptionsPicker
            bindStateCtx={this}
            bindStateName="form.language"
            value={this.state.form.language}
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
            value={this.state.form.venueId}
            options={venueOptions}
          />
        </Row>
        <Row name="个人简介" hint="教练的个人简介">
          <TextInput
            bindStateCtx={this}
            bindStateName="form.description"
            value={this.state.form.description}
            multiline={true}
          />
        </Row>
        <Row>
          <TextButton text="保存更改"
            onClick={this.onSubmit.bind(this)} 
            disabled={this.submitDisabled} 
          />
          <TextButton text="删除教练"
            onClick={this.onDelete.bind(this)} 
          />
        </Row>
      </Form>
    );
  }
}

module.exports = EditTrainerView;
