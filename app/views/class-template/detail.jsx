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
import './detail.css';

class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      venues: [],
      trainers: [],
      loading: true,
      data: this.props.data || {
        name: null,
        price: null,
        trainerId: null
      }
    };
  }
  async componentDidMount() {
    this.setState({
      trainers: await client.trainer.list(),
      loading: false
    });
  }
  get title() {
    if (this.props.data) {
      return this.props.data.name;
    } else {
      return '添加新的课程模版';
    }
  }
  get disabled() {
    if (!this.state.data.name ||
      !this.state.data.price ||
      !this.state.data.trainerId || 
      !this.state.data.description) {
      return true;
    } else {
      return false;
    }
  }
  async onsubmit() {
    await client.classTemplate.upsert(this.state.data);
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
              bindStateName="data.name" 
              bindStateValue={this.state.data.name}
            />
          </Row>
          <Row name="价格" required={true}>
            <TextInput 
              bindStateCtx={this} 
              bindStateName="data.price"
              bindStateType={Number}
              bindStateValue={this.state.data.price}
            />
          </Row>
          <Row name="选择教练" required={true}>
            <OptionsPicker
              bindStateCtx={this}
              bindStateName="data.trainerId"
              bindStateValue={this.state.data.trainerId}
              options={trainerOptions}
            />
          </Row>
          <Row name="课程描述" required={true}>
            <TextInput
              multiline={true}
              bindStateCtx={this}
              bindStateName="data.description"
              bindStateValue={this.state.data.description}
            />
          </Row>
          <Row>
            <TextButton text={this.props.data ? '保存修改' : '确认添加'}
              onClick={this.onsubmit.bind(this)} 
              disabled={this.disabled}
            />
          </Row>
        </Form>
      </div>
    );
  }
}

module.exports = Detail;
