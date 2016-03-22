"use strict";

import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  UIForm,
  UIRow,
  UITextInput,
  UIButton,
} from 'react-ui-form';
import { client } from '../api';
import '../layout/root-center.css';

class SignupIndex extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      form: {
        name: '',
        username: '',
        phone: '',
        smscode: '',
      },
    };
  }
  async onRequestSMSCode() {
    try {
      await client.user.smsRequest(this.state.form.phone);
    } catch (err) {
      alert(err && err.message);
    }
  }
  async onSignUp() {
    try {
      await client.user.smsRegisterNewOrgAndVenue(
        this.state.form.phone,
        this.state.form.smscode,
        {
          name: this.state.form.name,
          username: this.state.form.username,
        }
      );
      window.location.href = '/calendar';
    } catch (err) {
      alert(err && err.message + ', please contact: 400-8566-203');
    }
  }
  get disableRequestSMSCode() {
    return !(this.state.form.username &&
      this.state.form.name &&
      this.state.form.phone &&
      this.state.form.phone.length === 11);
  }
  get disableSignUp() {
    return this.disableRequestSMSCode || 
      !this.state.form.smscode;
  }
  render() {
    let content;
    return (
      <div className="box-container">
        <div className="box signup">
          <h1>注册工作室</h1>
          <UIForm className="contents">
            <UIRow>
              <UITextInput
                bindStateCtx={this}
                bindStateName="form.name"
                placeholder="工作室名称" 
              />
            </UIRow>
            <UIRow>
              <UITextInput 
                bindStateCtx={this}
                bindStateName="form.username"
                placeholder="用户名" 
              />
            </UIRow>
            <UIRow>
              <UITextInput 
                flex={0.7} 
                bindStateCtx={this}
                bindStateName="form.phone"
                placeholder="输入手机号码" 
              />
              <UIButton 
                flex={0.3} 
                text="获取验证码" 
                disableInterval={60} 
                disabled={this.disableRequestSMSCode}
                onClick={this.onRequestSMSCode.bind(this)}
              />
            </UIRow>
            <UIRow>
              <UITextInput 
                bindStateCtx={this}
                bindStateName="form.smscode"
                placeholder="输入验证码" 
              />
            </UIRow>
            <UIRow>
              <UIButton 
                text="创建工作室"
                block={true} 
                level="primary"
                onClick={this.onSignUp.bind(this)}
              />
            </UIRow>
          </UIForm>
          <p className="login-link">已有账号？点击这里<a href="/login">登录</a></p>
        </div>
      </div>
    );
  }
}

(function () {
  ReactDOM.render(
    <SignupIndex />,
    document.getElementById('root-container'));
})();