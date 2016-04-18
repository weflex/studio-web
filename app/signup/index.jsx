"use strict";

import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import UIFramework from 'weflex-ui';
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
          <div className="contents">
            <UIFramework className="contents">
              <UIFramework.Row>
                <UIFramework.TextInput
                  flex={1}
                  bindStateCtx={this}
                  bindStateName="form.name"
                  placeholder="工作室名称" 
                />
              </UIFramework.Row>
              <UIFramework.Row>
                <UIFramework.TextInput 
                  flex={1}
                  bindStateCtx={this}
                  bindStateName="form.username"
                  placeholder="用户名" 
                />
              </UIFramework.Row>
              <UIFramework.Row>
                <UIFramework.TextInput 
                  flex={0.7} 
                  bindStateCtx={this}
                  bindStateName="form.phone"
                  placeholder="输入手机号码" 
                />
                <UIFramework.Button 
                  flex={0.3} 
                  text="获取验证码" 
                  interval={60}
                  intervalFormat={(c) => `等待(${c})`} 
                  disabled={this.disableRequestSMSCode}
                  onClick={this.onRequestSMSCode.bind(this)}
                />
              </UIFramework.Row>
              <UIFramework.Row>
                <UIFramework.TextInput 
                  flex={1}
                  bindStateCtx={this}
                  bindStateName="form.smscode"
                  placeholder="输入验证码" 
                />
              </UIFramework.Row>
              <UIFramework.Row>
                <UIFramework.Button 
                  flex={1}
                  text="创建工作室"
                  block={true} 
                  level="primary"
                  onClick={this.onSignUp.bind(this)}
                />
              </UIFramework.Row>
            </UIFramework>
          </div>
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