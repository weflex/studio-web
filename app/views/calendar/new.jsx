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
      formData: {}
    };
    this.newClass = {}
    this.isModalShow = true;
  }

  async componentDidMount() {
    const trainers = await client.trainer.list();
    if (this.isModalShow) {
      this.setState({
        trainers,
        loading: false
      });
    }
  }

  onCreateClass() {
    // update class 
    this.props.onCreateClass(this.newClass);
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
        <h1>创建课程</h1>
        <Form className="class-new-form">
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
              options={this.state.trainers.map(item => {
                return {text: item.fullname.first, value: item.id};
              })}
            />
          </Row>
          <Row name="课程描述" required={true}>
            <TextInput
              multiline={true}
              bindStateCtx={this}
              bindStateName="formData.description"
            />
          </Row>
          <Row name="上课时间" required={true}>
            <TextInput
              flex={0.4}
              bindStateCtx={this}
              bindStateName="formData.date"
            />
            <TextInput
              flex={0.3}
              bindStateCtx={this}
              bindStateName="formData.from"
            />
            <TextInput
              flex={0.3}
              bindStateCtx={this}
              bindStateName="formData.to"
            />
          </Row>
          <Row>
            <TextButton text="确认添加"
              onClick={this.onCreateClass.bind(this)} 
              disabled={this.disabled}
            />
          </Row>
        </Form>
      </div>
    );
  }
}

exports.NewClassTemplate = NewClassTemplate;
