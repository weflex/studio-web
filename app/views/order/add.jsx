"use strict";

import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import UIFramework from 'weflex-ui';
import { client } from '../../api';
import { getFormatTime } from '../calendar/util.js';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      phone: '',
      user: '',
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
    };
  }
  async componentWillMount() {
    const today = moment().startOf('day');
    const venue = await client.user.getVenueById();
    const templates = (await client.classTemplate.list({
      where: {
        venueId: venue.id,
      },
      include: ['classes']
    })).map((template) => {
      template.classes = template.classes.filter((item) => {
        return moment(item.date).isAfter(today);
      });
      return template;
    }).filter((template) => {
      return template.classes.length > 0;
    });
    this.setState({templates});
  }
  async onPhoneInputChange(event) {
    const phone = event.target.value;
    if (phone.length === 11) {
      const members = await client.member.list({
        where: {phone},
        include: ['user']
      });
      if (members.length === 0) {
        this.setState({isUserNotFound: true});
      } else {
        // find a user
        const member = members[0];
        const memberships = await client.membership.list({
          where: {
            memberId: member.id
          },
          include: ['package']
        });
        this.setState({
          isUserNotFound: false,
          user: member.user,
          memberships,
        });
      }
    } else {
      this.setState({
        isUserNotFound: false,
        user: '',
        memberships: [],
      });
    }
  }
  onTemplateChange(event) {
    const classes = _.find(this.state.templates, {
      id: event.target.value
    }).classes;
    this.setState({classes});
  }
  get submitDisabled() {
    return !(
      this.state.membershipId &&
      this.state.classId &&
      this.state.member);
  }
  async onSubmit() {
    const template = _.find(this.state.templates, {
      id: this.state.templateId
    });
    const membership = _.find(this.state.memberships, {
      id: this.state.membershipId
    });
    try {
      // create an order
      await client.middleware('/transaction/add-order', {
        classId: this.state.classId,
        userId: this.state.user.id,
        membershipId: membership.id,
      }, 'post');
      if (typeof this.props.onComplete === 'function') {
        this.props.onComplete();
      }
    } catch (err) {
      alert(err.message);
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
    if (!this.state.isUserNotFound && this.state.user) {
      const user = this.state.user;
      view.push(
        <UIFramework.Row key="user">
          <UIFramework.Cell flex={0.1}>
            <UIFramework.Image
              circle={true}
              src={user.avatar} 
              size={20}
              style={{marginRight: 10}} />
          </UIFramework.Cell>
          <UIFramework.Cell flex={0.8}>
            <UIFramework.Text text={user.nickname} />
          </UIFramework.Cell>
        </UIFramework.Row>
      );
    } else if (this.state.isUserNotFound) {
      view.push(
        <div key="user" className="order-add-find-user">
          未找到对应用户，请先添加为会员
        </div>
      );
    }
    return view;
  }
  renderClassPicker() {
    let templateOptions = [{text: '未选择'}];
    let classOptions = [{text: '未选择'}];
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
        const from = getFormatTime(item.from);
        const to = getFormatTime(item.to);
        return {
          text: moment(item.date).format('MM[月]DD[日]') + ` (${from} - ${to})`,
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
      />
    ];
  }
  renderMemberships() {
    let membershipOptions = [{text: '未选择'}];
    if (this.state.memberships.length > 0) {
      membershipOptions = this.state.memberships.map((item) => {
        return {
          text: item.package.name,
          value: item.id
        }
      });
    }
    return (
      <UIFramework.Select
        flex={1}
        bindStateCtx={this}
        bindStateName="membershipId"
        options={membershipOptions}
      />
    );
  }
  render() {
    return (
      <UIFramework className="order-add">
        <UIFramework.Row name="手机号码" hint="预定课程用户的手机号码">
          {this.renderUserSearch()}
        </UIFramework.Row>
        <UIFramework.Row name="课程" hint="预约课程的名称，日期和时间">
          {this.renderClassPicker()}
        </UIFramework.Row>
        <UIFramework.Row name="会卡" hint="用户需要会卡才能创建订单">
          {this.renderMemberships()}
        </UIFramework.Row>
        <UIFramework.Row>
          <UIFramework.Button text="创建订单" onClick={this.onSubmit.bind(this)} disabled={this.submitDisabled}/>
        </UIFramework.Row>
      </UIFramework>
    );
  }
}
