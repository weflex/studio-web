"use strict";

import moment from 'moment';
import React from 'react';
import { ClipLoader } from 'halogen';
import { client } from '../../api';
import UIFramework from 'weflex-ui';
import { Select } from 'antd';
const Option = Select.Option;
import _ from 'lodash';
import {
  getTime,
  getFormatTime,
} from './util';
import './new.css';
import { addMinutes, format } from 'date-fns';

class NewClassTemplate extends React.Component {
  constructor(props) {
    super(props);
    const newData = NewClassTemplate.constructState(props);
    this.state = {
      trainers: [],
      loading: true,
      data: newData,
      templates: [],
      classPackages: [],
    };
    this.updateTimeBox = this.updateTimeBox.bind(this);
  }

  static constructState (nextProps) {
    const {from, to, template, date} = nextProps.data;
    const startsAt = new Date(date);
    startsAt.setHours(from.hour);
    startsAt.setMinutes(from.minute);
    const newData = Object.assign(
      {
        template: {},
        templateId: template.id,
        trainer: {},
        trainerId: template.trainerId,
        paymentOptionIds: template.paymentOptionIds,
        price: template.price,
        duration: template.duration,
        startsAt,
        endsAt: addMinutes(startsAt, template.duration),
      },
      nextProps.data,
      {
        from: getFormatTime(from),
        to: getFormatTime(to),
      }
    );
    return newData;
  }

  componentWillReceiveProps(nextProps) {
    const newData = NewClassTemplate.constructState(nextProps);
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
    const anyClassPackage = {
      id: '*',
      name: '所有会卡'
    };
    let classPackages = await client.classPackage.list({
      where: {
        venueId: venue.id
      },
    });
    classPackages = [anyClassPackage, ...classPackages];
    this.setState({
      trainers,
      templates,
      loading: false,
      classPackages,
    });
  }

  onCreateClass() {
    const {data} = this.state;
    let errorMessages = [];
    if(!data.price || data.price < 0) {
      errorMessages.push('`价格`');
    }
    if(!data.date || !data.from) {
      errorMessages.push('`上课时间`');
    }
    if(!data.duration || data.duration < 15) {
      errorMessages.push('`课程时长`');
    }
    if(!data.spot || data.spot <= 0) {
      errorMessages.push('`课位`');
    }
    if(errorMessages.length > 0) {
      return UIFramework.Message.error('请正确输入 ' + errorMessages.join('和') + '后确认保存。');
    }

    const newData = Object.assign({}, this.state.data, {
      template: this.template,
    });

    if (this.props.ctx) {
      this.props.ctx.createClass(newData);
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

  updateTimeBox() {
    let data = this.state.data;
    if(!data.date || !data.from || !data.duration) {
      data.endsAt = '';
      this.setState({data});
    }

    const from = getTime(data.from);
    const startsAt = new Date(data.date);
    startsAt.setHours(from.hour);
    startsAt.setMinutes(from.minute);

    data.startsAt = startsAt;
    data.endsAt = addMinutes(startsAt, data.duration);

    this.setState({data});
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
              value={this.state.data.price}
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
                const name = item.fullname.first + ' ' + item.fullname.last;
                return {text: name, value: item.id};
              })}
            />
          </UIFramework.Row>
          <UIFramework.Row name="课位" hint="请输入上课预留的课位" required={true}>
            <UIFramework.TextInput
              flex={1} 
              value={this.state.data.spot}
              bindStateCtx={this}
              bindStateType={Number}
              bindStateName="data.spot"
            />
          </UIFramework.Row>
          <UIFramework.Row name="课程时长" hint="课程时长不得少于15分钟" required={true}>
            <UIFramework.TextInput
              flex={0.8}
              value={this.state.data.duration}
              bindStateCtx={this}
              bindStateType={Number}
              bindStateName="data.duration"
              onChange={this.updateTimeBox}
            />
            <UIFramework.TextInput
              flex={0.2}
              value={"分钟"}
              className="disable-background"
              disabled
            />
          </UIFramework.Row>
          <UIFramework.Row name="选择上课时间" required={true}>
            <UIFramework.DateInput
              flex={0.4}
              bindStateCtx={this}
              bindStateName="data.date"
              value={this.formatDate(this.state.data.date)}
              onChange={this.updateTimeBox}
            />
            <UIFramework.TimeInput
              flex={0.27}
              bindStateCtx={this}
              bindStateName="data.from"
              value={this.state.data.from}
              onChange={this.updateTimeBox}
            />
            <div id="wrapEndsAt">
              <UIFramework.TextInput
                flex={0.82}
                value={format(this.state.data.endsAt, 'HH:mm')}
                className="disable-background"
                disabled
              />
            </div>
          </UIFramework.Row>
          <UIFramework.Row name="可用会卡" hint="可以用于预约该课程的会卡种类">
            <Select multiple
                    style={{width:'100%'}}
                    value={this.state.data.paymentOptionIds}
                    onSelect={(value) => {
                      let paymentOptionIds;
                      if ('*' === value) {
                        paymentOptionIds = ['*'];
                      } else {
                        paymentOptionIds = this.state.data.paymentOptionIds || [];
                        paymentOptionIds = paymentOptionIds.filter((opt) => opt !== '*');
                        paymentOptionIds.push(value);
                      }
                      if (paymentOptionIds.length === this.state.classPackages.length) {
                        paymentOptionIds = ['*'];
                      }
                      this.setState({data: Object.assign(this.state.data, {paymentOptionIds})});
                    }}
                    onDeselect={(value) => {
                      const paymentOptionIds = this.state.data.paymentOptionIds;
                      const index = paymentOptionIds.indexOf(value);
                      if (index > -1) {
                        paymentOptionIds.splice(index, 1);
                        this.setState({data: Object.assign(this.state.data, {paymentOptionIds})});
                      }}}>{
              this.state.classPackages.map((membership, key) =>
                <Option value={membership.id} key={key}>{membership.name}</Option>
              )
            }</Select>
          </UIFramework.Row>
          <UIFramework.Row name="课程描述">
            <UIFramework.TextInput
              flex={1}
              value={template.description}
              multiline={true}
              disabled={true}
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
