"use strict";

import React from 'react';
import { ClipLoader } from 'halogen';
import { client } from '../../api';
import {
  Form,
  Row,
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
        template: {}
      }, props.data),
    };
    this.isModalShow = true;
  }

  async componentDidMount() {
    if (this.isModalShow) {
      const venue = await client.user.getVenueById();
      const members = await client.orgMember.list({
        where: {
          venueId: venue.id,
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
        loading: false
      });
    }
  }

  onCreateClass() {
    // update class 
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

  render() {
    if (this.state.loading) {
      return (
        <div className="class-template-loading">
          <ClipLoader color="#777" />
          <p>正在载入资源</p>
        </div>
      );
    }
    return (
      <div className="class-new-container">
        <h1>{this.title}</h1>
        <Form className="class-new-form">
          <Row name="课程名" required={true}>
            <TextInput
              bindStateCtx={this} 
              bindStateValue={this.state.data.template.name}
              disabled={true}
            />
          </Row>
          <Row name="价格" required={true}>
            <TextInput 
              bindStateCtx={this}
              bindStateValue={this.state.data.template.price}
              disabled={true}
            />
          </Row>
          <Row name="选择教练" required={true}>
            <OptionsPicker
              bindStateCtx={this}
              bindStateName="data.trainerId"
              bindStateValue={this.state.data.trainerId}
              options={this.state.trainers.map(item => {
                return {text: item.fullname.first, value: item.id};
              })}
            />
          </Row>
          <Row name="课程描述" required={true}>
            <TextInput
              multiline={true}
              bindStateCtx={this}
              bindStateValue={this.state.data.template.description}
              disabled={true}
            />
          </Row>
          <Row name="上课时间" required={true}>
            <TextInput
              flex={0.4}
              bindStateCtx={this}
              bindStateName="data.date"
              bindStateValue={this.state.data.date}
              placeholder="日期：2017-03-04"
            />
            <TextInput
              flex={0.3}
              bindStateCtx={this}
              bindStateName="data.from"
              bindStateValue={this.formatTime(this.state.data.from)}
              placeholder="开始时间"
            />
            <TextInput
              flex={0.3}
              bindStateCtx={this}
              bindStateName="data.to"
              bindStateValue={this.formatTime(this.state.data.to)}
              placeholder="结束时间"
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
