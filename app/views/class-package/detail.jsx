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
  OptionsPicker,
  ColorPicker,
} from '../../components/form';
import { UIMembershipCard } from '../../components/ui-membership-card';
import './detail.css';

class CardDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      data: {
        name: null,
        category: null,
        accessType: null,
        lifetime: {
          value: null,
        },
      },
    };
  }
  async componentWillMount() {
    const id = this.props._[0].toLowerCase();
    let newState = this.state;
    if (id !== 'add') {
      newState.data = await client.classPackage.get(id);
      newState.data.lifetime = newState.data.lifetime || {};
    }
    newState.id = id;
    this.setState(newState);
  }
  get title() {
    return '添加新会员卡';
  }
  get actions() {
    let buttons = [
      {
        title: '返回',
        path: '/class/package'
      }
    ];
    if (this.props._[0].toLowerCase() !== 'add') {
      buttons.push({
        title: '删除该卡',
        onClick: this.onDelete.bind(this)
      });
    }
    buttons.push({
      title: '确认保存',
      onClick: this.onSubmit.bind(this)
    });
    return buttons;
  }
  get disabled() {
    if (!this.state.data.name) {
      return true;
    }
    if (!this.state.data.lifetime.value) {
      return true;
    }
    if (typeof this.state.data.price !== 'number') {
      return true;
    }
    return false;
  }
  gotoListPage() {
    // call navigate will unmount this component, but the onClick doesn't get back,
    // so use setTimeout to fix this problem.
    setTimeout(() => {
      const next = window.location.pathname.replace('/' + this.state.id, '');
      this.props.app.router.navigate(next);
    }, 0);
  }
  async onDelete(event) {
    await client.classPackage.delete(this.state.id);
    this.gotoListPage();
  }
  async onSubmit(event) {
    await client.classPackage.upsert(this.state.data);
    this.gotoListPage();
  }
  form() {
    return [
      <Row name="种类" required={true} key="category"
        hint="可以是团课或者私教">
        <OptionsPicker 
          bindStateCtx={this}
          bindStateName="data.category"
          value={this.state.data.category}
          options={[
            {text: '团课', value: 'group'},
            {text: '私教', value: 'private'},
          ]}
        />
      </Row>,
      <Row name="类型" required={true} key="accessType"
        hint="可以是多次卡或不限次卡">
        <OptionsPicker 
          bindStateCtx={this}
          bindStateName="data.accessType"
          value={this.state.data.accessType}
          options={[
            {text: '多次卡', value: 'multiple'},
            {text: '不限次卡', value: 'unlimited'},
          ]}
        />
      </Row>,
      <Row name="名字" required={true} key="name"
        hint="请给您的卡取个简单易懂的名字">
        <TextInput 
          bindStateCtx={this} 
          bindStateName="data.name"
          value={this.state.data.name}
        />
      </Row>,
      <Row name="有效次数" required={true} key="passes"
        hint="不限次卡不需要填写">
        <TextInput
          bindStateCtx={this}
          bindStateName="data.passes"
          value={this.state.data.passes}
          bindStateType={Number}
        />
      </Row>,
      <Row name="有效时间" required={true} key="lifetime"
        hint="设定该卡的有效期">
        <TextInput 
          flex={0.9}
          bindStateCtx={this}
          bindStateType={Number}
          value={this.state.data.lifetime.value}
          bindStateName="data.lifetime.value"
        />
        <OptionsPicker 
          flex={0.1}
          bindStateCtx={this}
          bindStateName="data.lifetime.scale"
          value={this.state.data.lifetime.scale}
          options={[
            {text: '天', value: 'day'},
            {text: '月', value: 'month'},
            {text: '年', value: 'year'},
          ]}
        />
      </Row>,
      <Row name="价格" required={true} key="price">
        <TextInput 
          flex={0.9}
          bindStateCtx={this}
          bindStateType={Number} 
          bindStateName="data.price" 
          value={this.state.data.price}
        />
        <OptionsPicker 
          flex={0.1}
          disabled={true}
          options={[
            {text: '元', value: 'yuan'},
          ]}
        />
      </Row>,
      <Row name="延期次数" required={true} key="extensible"
        hint="会员出差或工作室休息的时候可以给会卡延期">
        <OptionsPicker 
          bindStateCtx={this}
          bindStateName="data.extensible"
          value={this.state.data.extensible}
          options={[
            {text: '不能延期', value: 0},
            {text: '可1次', value: 1},
            {text: '可2次', value: 2},
            {text: '可3次', value: 3},
            {text: '可4次', value: 4},
          ]}
        />
      </Row>,
      <Row name="卡片颜色" key="color" hint="给不同的卡片设定不同的颜色可以帮你区分不同的卡">
        <ColorPicker
          bindStateCtx={this}
          bindStateName="data.color"
          value={this.state.data.color}
        />
      </Row>,
      <Row name="描述" hint="您可以在这里添加更多关于该卡的信息" key="description">
        <TextInput 
          bindStateCtx={this}
          bindStateName="data.description"
          value={this.state.data.description}
          multiline={true} 
        />
      </Row>,
    ];
  }
  render() {
    return (
      <div className="detail-cards class-package-detail-container">
        <div className="detail-cards-left">
          <Form className="detail-card class-package-detail-form">
            {this.form()}
          </Form>
        </div>
        <div className="detail-cards-right">
          <div className="detail-card class-package-detail-preview">
            <h3>预览</h3>
            <div className="class-package-detail-preview-card">
              <UIMembershipCard data={this.state.data} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = CardDetail;