"use strict";

import React from 'react';
import {
  UIForm,
  UITextInput,
  UIButton,
} from 'react-ui-form';
import { client } from '../../api';

class TabSMSCode extends React.Component {
  static title = '手机验证码登录';
  constructor(props) {
    super(props);
    this.state = {
      form: {
        phone: '',
        smscode: '',
      },
      phoneWarning: false,
      smscodeWarning: false,
    };
  }
  async onRequestSMSCode() {
    if (!this.state.form.phone ||
      this.state.form.phone.length !== 11) {
      this.refs.phone.focus();
      this.setState({
        phoneWarning: true
      });
      return false;
    }
    const data = await client.user.smsRequest(this.state.form.phone);
    console.log(data);
  }
  async onLogin() {
    let newState = this.state;
    if (!this.state.form.phone ||
      this.state.form.phone.length !== 11) {
      newState.phoneWarning = true;
    } else {
      newState.phoneWarning = false;
    }
    if (!this.state.form.smscode ||
      this.state.form.smscode.length !== 4) {
      newState.smscodeWarning = true;
    } else {
      newState.smscodeWarning = false;
    }
    if (!newState.phoneWarning && !newState.smscodeWarning) {
      const res = await client.user.smsLogin(
        this.state.form.phone, this.state.form.smscode);
      window.location.href = '/calendar';
    }
    this.setState(newState);
  }
  onPhoneInputChange(event) {
    if (this.state.phoneWarning && 
      this.state.form.phone.length === 11) {
      this.setState({
        phoneWarning: false
      });
    }
  }
  render() {
    let phoneClassName = 'login-row phone';
    if (this.state.phoneWarning) {
      phoneClassName += ' warning';
    }
    let smscodeClassName = 'login-row smscode';
    if (this.state.smscodeWarning) {
      smscodeClassName += ' warning';
    }
    return (
      <UIForm className="login-smscode">
        <div className={phoneClassName}>
          <UITextInput
            flex={0.7}
            type="text"
            ref="phone"
            bindStateCtx={this}
            bindStateName="form.phone"
            placeholder="输入手机号"
          />
          <UIButton
            flex={0.3}
            text="获取验证码"
            disableInterval={5}
            onClick={this.onRequestSMSCode.bind(this)}
          />
        </div>
        <div className={smscodeClassName}>
          <UITextInput 
            bindStateCtx={this}
            bindStateName="form.smscode"
            placeholder="输入验证码" 
          />
        </div>
        <div className="login-row">
          <UIButton 
            text="登录" 
            block={true} 
            level="primary"
            onClick={this.onLogin.bind(this)}
          />
        </div>
      </UIForm>
    );
  }
}

module.exports = TabSMSCode;
