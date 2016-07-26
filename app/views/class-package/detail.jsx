"use strict";

import React from 'react';
import { client } from '../../api';
import UIFramework from 'weflex-ui';
import UIMembershipCard from '../../components/ui-membership-card';
import './detail.css';

class CardDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      data: {
        name: null,
        category: 'group',
        accessType: 'multiple',
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
  onDelete(event) {
    let self = this;
    UIFramework.Modal.confirm({
      title: '你确认删除这张会片吗？',
      content: '删除会卡将会造成相关的会员失效',
      onOk: async () => {
        await client.classPackage.delete(self.state.id, self.state.data.modifiedAt);
        self.gotoListPage();
        UIFramework.Message.success('删除成功');
      },
    });
  }
  async onSubmit(event) {
    let shouldRefreshPage = false;
    try {
      await client.classPackage.upsert(this.state.data);
    } catch (err) {
      if (err.code === 'RESOURCE_EXPIRED') {
      }
    }
    if (!shouldRefreshPage) {
      this.gotoListPage();
    }
  }
  form() {
    return (
      <UIFramework>
        <UIFramework.Row name="种类" required={true} key="category"
          hint="可以是团课或者私教">
          <UIFramework.Select
            flex={1} 
            bindStateCtx={this}
            bindStateName="data.category"
            value={this.state.data.category}
            options={[
              {text: '团课', value: 'group'},
              {text: '私教', value: 'private'},
            ]}
          />
        </UIFramework.Row>
        <UIFramework.Row name="类型" required={true} key="accessType"
          hint="可以是多次卡或不限次卡">
          <UIFramework.Select
            flex={1} 
            bindStateCtx={this}
            bindStateName="data.accessType"
            value={this.state.data.accessType}
            options={[
              {text: '多次卡', value: 'multiple'},
              {text: '不限次卡', value: 'unlimited'},
            ]}
          />
        </UIFramework.Row>
        <UIFramework.Row name="名字" required={true} key="name"
          hint="请给您的卡取个简单易懂的名字">
          <UIFramework.TextInput 
            flex={1}
            bindStateCtx={this} 
            bindStateName="data.name"
            value={this.state.data.name}
          />
        </UIFramework.Row>
        <UIFramework.Row name="有效次数" required={true} key="passes"
          hint="不限次卡不需要填写">
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="data.passes"
            value={this.state.data.passes}
            bindStateType={Number}
          />
        </UIFramework.Row>
        <UIFramework.Row name="有效时间" required={true} key="lifetime"
          hint="设定该卡的有效期">
          <UIFramework.TextInput 
            flex={0.9}
            bindStateCtx={this}
            bindStateType={Number}
            value={this.state.data.lifetime.value}
            bindStateName="data.lifetime.value"
          />
          <UIFramework.Select
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
        </UIFramework.Row>
        <UIFramework.Row name="价格" required={true} key="price">
          <UIFramework.TextInput 
            flex={0.9}
            bindStateCtx={this}
            bindStateType={Number} 
            bindStateName="data.price" 
            value={this.state.data.price}
          />
          <UIFramework.Select
            flex={0.1}
            disabled={true}
            options={[
              {text: '元', value: 'yuan'},
            ]}
          />
        </UIFramework.Row>
        <UIFramework.Row name="延期次数" required={true} key="extensible"
          hint="会员出差或工作室休息的时候可以给会卡延期">
          <UIFramework.Select
            flex={1} 
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
        </UIFramework.Row>
        <UIFramework.Row name="卡片颜色" key="color" hint="给不同的卡片设定不同的颜色可以帮你区分不同的卡">
          <UIFramework.ColorPicker
            bindStateCtx={this}
            bindStateName="data.color"
            value={this.state.data.color}
          />
        </UIFramework.Row>
        <UIFramework.Row name="描述" hint="您可以在这里添加更多关于该卡的信息" key="description">
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="data.description"
            value={this.state.data.description}
            multiline={true} 
          />
        </UIFramework.Row>
      </UIFramework>
    );
  }
  render() {
    return (
      <div className="detail-cards class-package-detail-container">
        <div className="detail-cards-left">
          <div className="detail-card class-package-detail-form">
            {this.form()}
          </div>
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
