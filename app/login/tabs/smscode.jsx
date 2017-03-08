"use strict";

import React from 'react';
import UIFramework from 'weflex-ui';
import { client } from '../../api';

class TabSMSCode extends React.Component {
  static title = '手机验证码登录';
  constructor(props) {
    super(props);
    this.state = {
      phone: '',
      smscode: '',
    };
  }
  onRequestSMSCode() {
    client.user.smsRequest(this.state.phone);
  }
  async onLogin() {
    try {
      const res = await client.user.smsLogin(this.state.phone, this.state.smscode);
    } catch (err) {
    UIFramework.Modal.error({
      title: '登录失败',
      content: '请输入正确的验证码',
    });
    }
    window.location.href = '/calendar';
  }
  render() {
    return (
      <UIFramework>
        <UIFramework.Row>
          <UIFramework.TextInput
            flex={0.7}
            type="text"
            ref="phone"
            bindStateCtx={this}
            bindStateName="phone"
            placeholder="输入11位手机号"
          />
          <UIFramework.Button
            flex={0.3}
            text="获取验证码"
            interval={30}
            intervalFormat={(c) => `等待(${c})`}
            onClick={this.onRequestSMSCode.bind(this)}
            disabled={!this.state.phone || this.state.phone.length !== 11}
          />
        </UIFramework.Row>
        <UIFramework.Row>
          <UIFramework.TextInput
            flex={1}
            bindStateCtx={this}
            bindStateName="smscode"
            placeholder="输入验证码" 
          />
        </UIFramework.Row>
        <UIFramework.Row>
          <UIFramework.Button 
            flex={1}
            text="登录" 
            block={true} 
            level="primary"
            onClick={this.onLogin.bind(this)}
            disabled={!(this.state.phone && this.state.smscode)}
          />
        </UIFramework.Row>
      </UIFramework>
    );
  }
}

module.exports = TabSMSCode;
