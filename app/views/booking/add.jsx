"use strict";

import _ from 'lodash';
import moment from 'moment';
import hourminute from '@weflex/hourminute';
import React from 'react';
import './add.css';
import UIFramework from '@weflex/weflex-ui';
import { Tabs, DatePicker, TimePicker, Select } from 'antd';
import { client } from '../../api';
import { getFormatTime } from '../calendar/util.js';
const TabPane = Tabs.TabPane;
import { format } from 'date-fns';
const { Option, OptGroup } = Select;

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      phone: '',
      member: '',
      date: Date.now(),
      template: '',
      class: '',
      membershipId: '',
      // selections
      templates: [],
      classes: [],
      memberships: [],
      // form validation
      isUserNotFound: false,
      isSpotsAvailable: true,
      paymentOptionIds: [],
      trainers: [],
      startsAtString: moment().format('hh:mm'),
      trainerId: '',
      hour: 0,
      minute: 0,
      activeTab: 'GroupTraining',
    };
  }
  async componentWillMount() {
    const today = moment().startOf('day');
    const venue = await client.user.getVenueById();
    const trainers = await client.collaborator.list({
      where: {
        venueId: venue.id,
        ptScheduleId: {
          exists: true,
          trashedAt: {
            exists: false,
          }
        }
      },
      include: ['ptSchedule'],
    });
    const templates = (await client.classTemplate.list({
      where: {
        venueId: venue.id,
      },
      include: [
        {
          relation: 'classes',
          scope: {
            where: {
              trashedAt: {
                exists: false
              }
            }
          }
        }
      ]
    })).map((template) => {
      template.classes = template.classes.filter((item) => {
        return moment(item.date).isAfter(today);
      });
      return template;
    }).filter((template) => {
      return template.classes.length > 0;
    });
    this.setState({ templates, trainers });
  }
  async onPhoneInputChange(event) {
    const phone = event.target.value;
    const venue = await client.user.getVenueById();
    if (phone.length === 11) {
      const members = await client.member.list({
        where: {
          phone,
          venueId: venue.id,
          trashedAt: {
            exists: false
          }
        },
        include: ['avatar']
      });
      if (members.length === 0) {
        this.setState({ isUserNotFound: true });
      } else {
        // find a user
        const member = members[0];

        let memberships;
        try {
          const now = new Date();
          memberships = (await client.membership.list({
            where: {
              'memberId': member.id,
            },
            include: 'package'
          }))
        } catch (error) {
          console.error(error);
          memberships = [];
        } finally {
          this.setState({
            isUserNotFound: false,
            memberships,
            member,
          });
        }
      }
    } else {
      this.setState({
        isUserNotFound: false,
        memberships: [],
        member: '',
      });
    }
  }
  onTemplateChange(event) {
    let classes = _.find(this.state.templates, {
      id: event.target.value
    }).classes;
    classes = _.sortBy(classes, [
      (item) => item['startsAt']
    ]);
    this.setState({ classes });
  }
  onClassChange(event) {
    let aClass = _.find(this.state.classes, {
      id: event.target.value
    });
    this.setState({
      isSpotsAvailable: aClass.spotsAvailable > 0,
      paymentOptionIds: aClass.paymentOptionIds || [],
    });
  }
  async onSubmit() {
    const template = _.find(this.state.templates, {
      id: this.state.templateId
    });
    let membership = _.find(this.state.memberships, {
      membershipId: this.state.membershipId
    });
    try {
      // create an order
        await client.middleware('/transaction/add-order', {
          classId: this.state.classId,
          userId: this.state.member.userId,
          membershipId: this.state.membershipId,
          memberId: this.state.member.id,
        }, 'post');
      if (typeof this.props.onComplete === 'function') {
        this.props.onComplete();
      }
    } catch (error) {
      UIFramework.Modal.error({
        title: '创建订单失败',
        content: error.message,
      });
    }
  }
  async onSubmitPrivateTraining() {
    const startsAt = moment(this.state.date)
      .hour(this.state.hour)
      .minute(this.state.minute)
      .second(0)
      .milliseconds(0)
    try {
      await client.ptSession.create({
        trainerId: this.state.trainerId,
        userId: this.state.member.userId,
        membershipId: this.state.membershipId,
        startsAt: startsAt.toDate(),
        memberId: this.state.member.id,
      });
      if (typeof this.props.onComplete === 'function') {
        this.props.onComplete();
      }
    } catch (error) {
      UIFramework.Modal.error({
        title: '创建订单失败',
        content: error.message ,
      });
    }
  }
  renderUserSearch() {
    const view = [
      <UIFramework.TextInput
        key="input"
        flex={1}
        bindStateCtx={this}
        bindStateName="phone"
        bindStateValue={this.state.phone}
        onChange={this.onPhoneInputChange.bind(this)}
      />,
      <UIFramework.Divider key="divider" />,
    ];
    if (!this.state.isUserNotFound && this.state.member) {
      const member = this.state.member;
      view.push(
        <UIFramework.Row key="member">
          <UIFramework.Cell flex={0.1}>
            <UIFramework.Image
              circle={true}
              src={member.avatar}
              size={20}
              style={{ marginRight: 10 }} />
          </UIFramework.Cell>
          <UIFramework.Cell flex={0.8}>
            <UIFramework.Text text={member.nickname} />
          </UIFramework.Cell>
        </UIFramework.Row>
      );
    } else if (this.state.isUserNotFound) {
      view.push(
        <div key="user" className="order-add-find-user">
          未找到对应用户，系统将自动创建用户并绑定手机号
        </div>
      );
    }
    return view;
  }
  renderClassPicker() {
    let templateOptions = [{ text: '未选择' }];
    let classOptions = [{ text: '未选择' }];
    if (this.state.templates.length > 0) {
      templateOptions = this.state.templates.map((item) => {
        return {
          text: `${item.name} (${item.classes.length})`,
          value: item.id
        };
      });
    }
    if (this.state.classes.length) {
      classOptions = this.state.classes.map((item) => {
        return {
          text: format(item.startsAt, 'MM月DD日 HH:mm - ') + format(item.endsAt, 'HH:mm'),
          value: item.id
        };
      });
    }
    return [
      <UIFramework.Select
        flex={0.6}
        key="template"
        bindStateCtx={this}
        bindStateName="templateId"
        options={templateOptions}
        onChange={this.onTemplateChange.bind(this)}
      />,
      <UIFramework.Select
        flex={0.4}
        key="class"
        bindStateCtx={this}
        bindStateName="classId"
        options={classOptions}
        onChange={this.onClassChange.bind(this)}
      />
    ];
  }
  renderMemberships() {
    let membershipOptions = [{ text: '未选择' }];
    let paymentOptionIds = this.state.paymentOptionIds;
    let available = [], unavailable = [], expires = [], Inoperative = []
    const now = new Date()
    if ('PrivateTraining' === this.state.activeTab) {
      const trainer = this.state.trainers.filter((trainer) => {
        return trainer.id === this.state.trainerId
      })[0];
      if (trainer && trainer.ptSchedule && trainer.ptSchedule.paymentOptionIds) {
        paymentOptionIds = trainer.ptSchedule.paymentOptionIds;
      } else {
        paymentOptionIds = [];
      }
    }
    if (this.state.memberships.length > 0) {
      membershipOptions = this.state.memberships.map((item) => {
        if (moment(item.expiresAt).isBefore(moment(now)) || item.accessType == "multiple" && item.available == 0) {
          expires.push(
            <Option value={item.id} disabled >{item.name}</Option>
          )
        } else if (moment(item.startsAt).isAfter(moment(now))) {
          Inoperative.push(
            <Option value={item.id} disabled style={{ color: '#80C7E8' }}>{item.name}</Option>
          )
        } else if (paymentOptionIds.indexOf('*') > -1 || paymentOptionIds.indexOf(item.packageId) > -1) {
          available.push(
            <Option value={item.id} style={{ color: '#6ED4A4' }}>{item.name}</Option>
          )
        } else {
          unavailable.push(
            <Option value={item.id} disabled style={{ color: '#FF8AC2' }}>{item.name}</Option>
          )
        }
      });
    }

    return [
      <OptGroup label="可使用 （以下会卡可以适用于此课程或者该私教）" >
        {available}
      </OptGroup>,
      <OptGroup label="不匹配 （以下会卡无法适用于此课程或者该私教）" >
        {unavailable}
      </OptGroup>,
      <OptGroup label="未生效 （以下会卡生效时间未到）">
        {Inoperative}
      </OptGroup>,
      <OptGroup label="已过期 （以下会卡已经失效）">
        {expires}
      </OptGroup>,
    ]
  }

  get submitDisabled() {
    if (this.state.activeTab.indexOf("GroupTraining") > -1) {
      return !(this.state.isSpotsAvailable &&
        this.state.phone.length == 11 &&
        this.state.date &&
        this.state.membershipId);
    } else {
      return !(
        this.state.phone.length == 11 &&
        this.state.date &&
        this.state.membershipId &&
        this.state.trainerId &&
        this.state.hour &&
        this.state.minute == 0 || this.state.minute &&
        this.state.membershipId
      );
    }
  }

  handleChange(value) {
    if (value) {
      this.setState({
        membershipId: value
      })
    }
  }
  render() {
    const trainerOptions = this.state.trainers.map((trainer) => {
      return {
        text: trainer.fullname.first + trainer.fullname.last,
        value: trainer.id,
      }
    });
    return (
      <Tabs defaultActiveKey='1'
        onChange={(key) => {
          const activeTab = ('2' === key) ? 'PrivateTraining' : 'GroupTraining';
          this.setState({ activeTab });
        }}>
        <TabPane tab='团课' key='1'>
          <UIFramework className="order-add">
            <UIFramework.Row name="手机号码" hint="预定课程用户的手机号码">
              {this.renderUserSearch()}
            </UIFramework.Row>
            <UIFramework.Row name="课程" hint="预约课程的名称，日期和时间">
              {this.renderClassPicker()}
            </UIFramework.Row>
            {
              this.state.isSpotsAvailable ? '' : (
                <UIFramework.Row>
                  <span style={{ color: 'red' }}>此课程课位已满,无法创建新订单</span>
                </UIFramework.Row>
              )
            }
            <UIFramework.Row name="会卡" hint="用户需要会卡才能创建订单">
              <Select placeholder="未选择" style={{ width: 475 }} onChange={this.handleChange.bind(this)}  >
                {this.renderMemberships()}
              </Select>
            </UIFramework.Row>
            <UIFramework.Row>
              <UIFramework.Button text="创建订单" onClick={this.onSubmit.bind(this)} disabled={this.submitDisabled} />
            </UIFramework.Row>
          </UIFramework>
        </TabPane>
        <TabPane tab='私教' key='2'>
          <UIFramework className="order-add">
            <UIFramework.Row name="手机号码" hint="预定会员的手机号码">
              {this.renderUserSearch()}
            </UIFramework.Row>
            <UIFramework.Row name="教练" hint="">
              <UIFramework.Select
                bindStateCtx={this}
                bindStateName='trainerId'
                options={trainerOptions}
                flex={1} />
            </UIFramework.Row>
            <UIFramework.Row name='课程时间' hint='课程开始时间'>
              <DatePicker
                onChange={(date) => {
                  this.setState({ date: date.toDate() });
                }}
                flex={0.5} />
              <TimePicker
                onChange={(time) => {
                  this.setState({
                    hour: time.hour(),
                    minute: time.minute(),
                  })
                }}
                format={'HH:mm'}
                flex={0.5} />
            </UIFramework.Row>
            <UIFramework.Row name='支付会卡'>
              <Select placeholder="未选择" style={{ width: 475 }} onChange={this.handleChange.bind(this)}>
                {this.renderMemberships()}
              </Select>
            </UIFramework.Row>
            <UIFramework.Row>
              <UIFramework.Button text="创建订单" onClick={this.onSubmitPrivateTraining.bind(this)} disabled={this.submitDisabled} />
            </UIFramework.Row>
          </UIFramework>
        </TabPane>
      </Tabs>
    );
  }
}
