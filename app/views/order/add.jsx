"use strict";

import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import {
  UIForm,
  UIRow,
  UITextInput,
  UIButton,
  UIOptionPicker,
} from '../../components/ui-form';
import { client } from '../../api';
import './add.css';

class AddOrderView extends React.Component {
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
      const users = await client.middleware('/search/users', {phone});
      if (users.length === 0) {
        this.setState({isUserNotFound: true});
      } else {
        // find a user
        const user = users[0];
        const memberships = await client.membership.list({
          where: {
            userId: user.id
          },
          include: ['package']
        });
        this.setState({
          isUserNotFound: false,
          user,
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
  async onSubmit() {
    const template = _.find(this.state.templates, {
      id: this.state.templateId
    });
    const membership = _.find(this.state.memberships, {
      id: this.state.membershipId
    });
    try {
      // create an order
      await client.order.upsert({
        classId: this.state.classId,
        userId: this.state.user.id,
        payments: [
          {
            fee: template.price,
            membership,
          }
        ]
      });
      if (typeof this.props.onComplete === 'function') {
        this.props.onComplete();
      }
    } catch (err) {
      alert(err.message);
    }
  }
  renderUserSearch() {
    const view = [
      <UITextInput
        key="input"
        bindStateCtx={this}
        bindStateName="phone"
        bindStateValue={this.state.phone}
        onChange={this.onPhoneInputChange.bind(this)}
      />,
    ];
    if (!this.state.isUserNotFound && this.state.user) {
      const user = this.state.user;
      const avatar = user.avatar && user.avatar.uri;
      view.push(
        <div key="user" className="order-add-find-user">
          <img src={avatar} />
          <span>{user.nickname}</span>
        </div>
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
        const from = item.from.hour + ':' + item.from.minute;
        const to = item.to.hour + ':' + item.to.minute;
        const duration = from + ' - ' + to;
        return {
          text: moment(item.date).format('MM[月]DD[日]') + ` (${duration})`,
          value: item.id
        };
      });
    }
    return [
      <UIOptionPicker 
        flex={0.6}
        key="template"
        bindStateCtx={this}
        bindStateName="templateId"
        options={templateOptions}
        onChange={this.onTemplateChange.bind(this)}
      />,
      <UIOptionPicker
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
      <UIOptionPicker
        bindStateCtx={this}
        bindStateName="membershipId"
        options={membershipOptions}
      />
    );
  }
  render() {
    return (
      <UIForm className="order-add">
        <UIRow name="手机号码" hint="预定课程用户的手机号码">
          {this.renderUserSearch()}
        </UIRow>
        <UIRow name="课程" hint="预约课程的名称，日期和时间">
          {this.renderClassPicker()}
        </UIRow>
        <UIRow name="会卡" hint="用户需要会卡才能创建订单">
          {this.renderMemberships()}
        </UIRow>
        <UIRow>
          <UIButton text="创建订单" onClick={this.onSubmit.bind(this)} />
        </UIRow>
      </UIForm>
    );
  }
}

module.exports = AddOrderView;
