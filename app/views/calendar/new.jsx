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
  }

  static constructState (nextProps) {
    const {from, to, template} = nextProps.data;
    const newData = Object.assign(
      {
        template: {},
        templateId: template.id,
        trainer: {},
        trainerId: template.trainerId,
        paymentOptionIds: template.paymentOptionIds,
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
    const newData = Object.assign({}, this.state.data, {
      from: getTime(this.state.data.from),
      to: getTime(this.state.data.to),
      template: this.template,
    });
    delete newData.spotsBooked;

    const getMinutes = (time) => {
      return time.hour * 60 + time.minute;
    };

    if (newData.spot <= 0) {
      alert('课位必须大于 0');
    } else if (getMinutes(newData.to) - getMinutes(newData.from) < 15) {
      alert('每节课程时长必须大于15分钟');
    } else {
      if (this.props.ctx) {
        this.props.ctx.createClass(newData);
      } else {
        this.props.onCreateClass(newData);
      }
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
