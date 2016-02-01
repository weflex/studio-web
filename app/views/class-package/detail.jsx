"use strict";

import React from 'react';
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

class CardDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: null,
      accessType: null,
      lifetime: {
        value: null,
      }
    };
  }
  get title() {
    return '添加新会员卡';
  }
  get actions() {
    return [];
  }
  get disabled() {
    if (!this.state.name) {
      return true;
    }
    if (!this.state.lifetime.value) {
      return true;
    }
    if (!this.state.price) {
      return true;
    }
    return false;
  }
  async onsubmit(event) {
    try {
      await client.classPackage.create(this.state);
    } catch (err) {
      console.error(err && err.stack);
    }
  }
  form() {
    return [
      <Row name="名称" required={true} key={0}
        hint="请给您的卡取个简单易懂的名字">
        <TextInput 
          bindStateCtx={this} 
          bindStateName="name"
          bindStateType={String}
        />
      </Row>,
      <Row name="次数选择" required={true} key={1}
        hint="设定该健身卡属于一次性，多次，无限次卡">
        <OptionsPicker
          bindStateCtx={this} 
          bindStateName="accessType"
          options={[
            {text: '多次卡', value: 'multiple'},
            {text: '无限次', value: 'unlimited'}
          ]} 
        />
      </Row>,
      <Row name="有效期" required={true} key={2}
        hint="设定该卡的有效期">
        <TextInput 
          flex={0.5}
          bindStateCtx={this}
          bindStateType={Number}
          bindStateName="lifetime.value"
        />
        <OptionsPicker 
          flex={0.5}
          bindStateCtx={this}
          bindStateName="lifetime.scale"
          options={[
            {text: '天', value: 'day'},
            {text: '月', value: 'month'},
            {text: '年', value: 'year'},
          ]}
        />
      </Row>,
      <Row name="价格" required={true} hint="课程价格" key={3}>
        <TextInput 
          bindStateCtx={this}
          bindStateType={Number} 
          bindStateName="price" 
        />
      </Row>,
      <Row name="延期次数" required={true} key={4}
        hint="您的会员可能因为各种情况需要延长卡的有效期，您可以在这里设置延长次数">
        <OptionsPicker 
          bindStateCtx={this}
          bindStateName="extensible"
          options={[
            {text: '不能延期', value: 0},
            {text: '可1次', value: 1},
            {text: '可2次', value: 2},
            {text: '可3次', value: 3},
            {text: '可4次', value: 4},
          ]}
        />
      </Row>,
      <Row name="描述" hint="您可以在这里添加更多关于该卡的信息" key={5}>
        <TextInput 
          bindStateCtx={this}
          bindStateName="description"
          multiline={true} 
        />
      </Row>,
      <Row name="所属种类" required={true} key={6}
        hint="您可以为这张卡和其他您创建过的卡整理归类。只支持单选，可以删除预定义的类别">
        <OptionsPicker 
          bindStateCtx={this}
          bindStateName="category"
          options={[
            {text: '年卡', value: '年卡'},
            {text: '次卡', value: '次卡'},
          ]}
        />
      </Row>,
      <Row key={7}>
        <TextButton text="确认添加"
          onClick={this.onsubmit.bind(this)} 
          disabled={this.disabled}
        />
      </Row>
    ];
  }
  render() {
    return (
      <div className="class-package-detail-container">
        <Form className="class-package-detail-form">
          {this.form()}
        </Form>
        <div className="class-package-detail-preview">

        </div>
      </div>
    );
  }
}

module.exports = CardDetail;