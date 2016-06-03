"use strict";

import moment from 'moment';
import React from 'react';
import { ClipLoader } from 'halogen';
import { client } from '../../api';
import UIFramework from 'weflex-ui';
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
      trainer: {},
      trainerId: props.data.template.trainerId,
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

  componentWillReceiveProps(nextProps) {
    const newData = Object.assign({}, this.state.data, {
      from: getFormatTime(nextProps.data.from),
      to: getFormatTime(nextProps.data.to),
      date: nextProps.data.date
    });
    this.setState({ data: newData });
  }

  async componentDidMount() {
    const venue = await client.user.getVenueById();
    const templates = await client.classTemplate.list({
      where: {
        venueId: venue.id,
      },
    });
    const members = await client.collaborator.list({
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
      template: this.template,
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

  formatDate(date) {
    return moment(date).format('YYYY-MM-DD');
  }

  get template() {
    return _.find(this.state.templates, {
      id: this.state.data.templateId
    }) || {};
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
    const template = this.template;
    return (
      <div className="class-new-container">
        <UIFramework className="class-new-form">
          <UIFramework.Row name="选择课程模版" required={true} hint="选择课程模版可以看到不同课程的价格、教练和描述">
            <UIFramework.Select
              flex={1}
              bindStateCtx={this}
              bindStateName="data.templateId"
              value={this.state.data.templateId}
              options={this.state.templates.map((item) => {
                return {text: item.name, value: item.id};
              })}
            />
          </UIFramework.Row>
          <UIFramework.Row name="价格" hint="课程模版的价格">
            <UIFramework.TextInput
              flex={1} 
              value={template.price}
              disabled={true}
            />
          </UIFramework.Row>
          <UIFramework.Row name="教练" hint="选择上课的教练">
            <UIFramework.Select
              flex={1}
              bindStateCtx={this}
              bindStateName="data.trainerId"
              value={this.state.data.trainerId}
              options={this.state.trainers.map(item => {
                return {text: item.fullname.first, value: item.id};
              })}
            />
          </UIFramework.Row>
          <UIFramework.Row name="课程描述">
            <UIFramework.TextInput
              flex={1}
              value={template.description}
              multiline={true}
              disabled={true}
            />
          </UIFramework.Row>
          <UIFramework.Row name="选择上课时间" required={true}>
            <UIFramework.DateInput
              flex={0.4}
              bindStateCtx={this}
              bindStateName="data.date"
              value={this.formatDate(this.state.data.date)}
            />
            <UIFramework.TimeInput
              flex={0.3}
              bindStateCtx={this}
              bindStateName="data.from"
              value={this.state.data.from}
            />
            <UIFramework.TimeInput
              flex={0.3}
              bindStateCtx={this}
              bindStateName="data.to"
              value={this.state.data.to}
            />
          </UIFramework.Row>
          <UIFramework.Row>
            <UIFramework.Button 
              text={this.state.data ? '保存修改' : '确认添加'}
              onClick={this.onCreateClass.bind(this)} 
            />
          </UIFramework.Row>
        </UIFramework>
      </div>
    );
  }
}

exports.NewClassTemplate = NewClassTemplate;
