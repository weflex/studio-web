"use strict";

import moment from 'moment';
import React from 'react';
import { ClipLoader } from 'halogen';
import { client } from '../../api';
import {
  UIForm,
  UIRow,
  UIDateInput,
  UITimeInput,
  UITextInput,
  UIButton,
  UIOptionPicker
} from 'react-ui-form';
import {
  getTime,
  getFormatTime,
} from './util';
import './new.css';

class NewClassTemplate extends React.Component {
  constructor(props) {
    super(props);
    const newData = Object.assign({
      template: {},
      templateId: props.data.template.id,
    }, props.data, {
      from: getFormatTime(props.data.from),
      to: getFormatTime(props.data.to),
    });
    this.state = {
      trainers: [],
      loading: true,
      data: newData,
      templates: [],
    };
    this.isModalShow = true;
  }

  async componentDidMount() {
    const venue = await client.user.getVenueById();
    const templates = await client.classTemplate.list({
      where: {
        venueId: venue.id,
      },
    });
    const members = await client.orgMember.list({
      where: {
        or: [
          {
            orgId: venue.orgId,
          },
          {
            venueId: venue.id,
          },
        ],
      },
      include: ['roles'],
    });
    const trainers = members.filter((member) => {
      return member.roles.filter((role) => {
        return role.name === 'trainer';
      });
    });
    this.setState({
      trainers,
      templates,
      loading: false,
    });
  }

  onCreateClass() {
    const newData = Object.assign({}, this.state.data, {
      from: getTime(this.state.data.from),
      to: getTime(this.state.data.to),
    });
    const getMinutes = (time) => {
      return time.hour * 60 + time.minute;
    };
    if (getMinutes(newData.to) - getMinutes(newData.from) < 15) {
      alert('每节课程时长必须大于15分钟');
    } else {
      this.props.onCreateClass(newData);
    }
  }

  get title() {
    if (this.state.data.template && this.state.data.template.name) {
      return this.state.data.template.name;
    } else {
      return '创建新课程';
    }
  }

  formatDate(date) {
    return moment(date).format('YYYY-MM-DD');
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="class-template-loading">
          <ClipLoader color="#777" />
          <p>正在载入资源</p>
        </div>
      );
    }
    const template = _.find(this.state.templates, {
      id: this.state.data.templateId
    }) || {};

    return (
      <div className="class-new-container">
        <h1>{this.title}</h1>
        <UIForm className="class-new-form">
          <UIRow name="选择课程模版" required={true} hint="选择课程模版可以看到不同课程的价格、教练和描述">
            <UIOptionPicker
              bindStateCtx={this}
              bindStateName="data.templateId"
              value={this.state.data.templateId}
              options={this.state.templates.map((item) => {
                return {text: item.name, value: item.id};
              })}
            />
          </UIRow>
          <UIRow name="价格" hint="课程模版的价格">
            <UITextInput 
              value={template.price}
              disabled={true}
            />
          </UIRow>
          <UIRow name="教练" hint="选择上课的教练">
            <UIOptionPicker
              bindStateCtx={this}
              bindStateName="data.trainerId"
              value={this.state.data.trainerId}
              options={this.state.trainers.map(item => {
                return {text: item.fullname.first, value: item.id};
              })}
            />
          </UIRow>
          <UIRow name="课程描述">
            <UITextInput
              value={template.description}
              multiline={true}
              disabled={true}
            />
          </UIRow>
          <UIRow name="选择上课时间" required={true}>
            <UIDateInput
              flex={0.4}
              bindStateCtx={this}
              bindStateName="data.date"
              value={this.formatDate(this.state.data.date)}
            />
            <UITimeInput
              flex={0.3}
              bindStateCtx={this}
              bindStateName="data.from"
              value={this.state.data.from}
            />
            <UITimeInput
              flex={0.3}
              bindStateCtx={this}
              bindStateName="data.to"
              value={this.state.data.to}
            />
          </UIRow>
          <UIRow>
            <UIButton 
              text={this.state.data ? '保存修改' : '确认添加'}
              onClick={this.onCreateClass.bind(this)} 
            />
          </UIRow>
        </UIForm>
      </div>
    );
  }
}

exports.NewClassTemplate = NewClassTemplate;
