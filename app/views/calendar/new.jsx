"use strict";

import moment from 'moment';
import React from 'react';
import { ClipLoader } from 'halogen';
import { client } from '../../api';
import {
  Form,
  Row,
  DateInput,
  TimeInput,
  TextInput,
  TextButton,
  Label,
  HintText,
  OptionsPicker
} from '../../components/form';
import './new.css';

class NewClassTemplate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trainers: [],
      loading: true,
      data: Object.assign({
        template: {},
        templateId: props.data.template.id,
      }, props.data),
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
    this.props.onCreateClass(this.state.data);
  }

  get title() {
    if (this.state.data.template && this.state.data.template.name) {
      return this.state.data.template.name;
    } else {
      return '创建新课程';
    }
  }

  formatTime(time) {
    return time.hour + ':' + time.minute;
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
        <Form className="class-new-form">
          <Row name="选择课程模版" required={true} hint="选择课程模版可以看到不同课程的价格、教练和描述">
            <OptionsPicker
              bindStateCtx={this}
              bindStateName="data.templateId"
              defaultValue={this.state.data.templateId}
              options={this.state.templates.map((item) => {
                return {text: item.name, value: item.id};
              })}
            />
          </Row>
          <Row name="价格" hint="课程模版的价格">
            <TextInput 
              value={template.price}
              disabled={true}
            />
          </Row>
          <Row name="教练" hint="选择上课的教练">
            <OptionsPicker
              bindStateCtx={this}
              bindStateName="data.trainerId"
              defaultValue={this.state.data.trainerId}
              options={this.state.trainers.map(item => {
                return {text: item.fullname.first, value: item.id};
              })}
            />
          </Row>
          <Row name="课程描述">
            <TextInput
              value={template.description}
              multiline={true}
              disabled={true}
            />
          </Row>
          <Row name="选择上课时间" required={true}>
            <DateInput
              flex={0.4}
              bindStateCtx={this}
              bindStateName="data.date"
              defaultValue={this.formatDate(this.state.data.date)}
            />
            <TimeInput
              flex={0.3}
              bindStateCtx={this}
              bindStateName="data.from"
              defaultValue={this.formatTime(this.state.data.from)}
            />
            <TimeInput
              flex={0.3}
              bindStateCtx={this}
              bindStateName="data.to"
              defaultValue={this.formatTime(this.state.data.to)}
            />
          </Row>
          <Row>
            <TextButton text={this.state.data ? '保存修改' : '确认添加'}
              onClick={this.onCreateClass.bind(this)} 
            />
          </Row>
        </Form>
      </div>
    );
  }
}

exports.NewClassTemplate = NewClassTemplate;
