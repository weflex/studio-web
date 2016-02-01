"use strict";

import React from 'react';
import { ClipLoader } from 'halogen';
import {
  Form,
  Row,
  TextInput,
  TextButton,
  Label,
  HintText,
  OptionsPicker
} from '../../components/form';
import './detail.css';

const client = require('@weflex/gian').getClient('dev');

class NewClassTemplate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      venues: [],
      trainers: [],
      loading: true
    };
  }
  async componentDidMount() {
    this.setState({
      formData: {
        name: null,
        price: null,
        trainerId: null
      },
      trainers: await client.trainer.list(),
      loading: false
    });
  }
  get title() {
    return '添加新的课程模版';
  }
  get disabled() {
    if (!this.state.formData.name ||
      !this.state.formData.price ||
      !this.state.formData.trainerId || 
      !this.state.formData.description) {
      return true;
    } else {
      return false;
    }
  }
  async onsubmit() {
    await client.classTemplate.create(this.state.formData);
  }
  render() {
    if (this.state.loading) {
      return (
        <div className="class-template-loading">
          <ClipLoader color="#696969" size="14" />
          <p>正在加载教练信息...</p>
        </div>
      );
    }
    let trainerOptions = this.state.trainers.map(
      item => {
        return {
          text: `${item.fullname.first} ${item.fullname.last}`,
          value: item.id
        };
      }
    );
    return (
      <div className="class-template-new-container">
        <Form className="class-template-new-form">
          <Row name="课程名" required={true}>
            <TextInput
              bindStateCtx={this} 
              bindStateName="formData.name" 
            />
          </Row>
          <Row name="价格" required={true}>
            <TextInput 
              bindStateCtx={this} 
              bindStateName="formData.price"
              bindStateType={Number}
            />
          </Row>
          <Row name="选择教练" required={true}>
            <OptionsPicker
              bindStateCtx={this}
              bindStateName="formData.trainerId"
              options={trainerOptions}
            />
          </Row>
          <Row name="课程描述" required={true}>
            <TextInput
              multiline={true}
              bindStateCtx={this}
              bindStateName="formData.description"
            />
          </Row>
          <Row>
            <TextButton text="确认添加"
              onClick={this.onsubmit.bind(this)} 
              disabled={this.disabled}
            />
          </Row>
        </Form>
      </div>
    );
  }
}

module.exports = NewClassTemplate;
