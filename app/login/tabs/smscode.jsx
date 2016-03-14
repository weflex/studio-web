"use strict";

import React from 'react';
import { client } from '../../api';

class TabSMSCode extends React.Component {
  static title = '手机验证码登录';
  constructor(props) {
    super(props);
    this.state = {
      count: -1,
      phoneWarning: false,
      smscodeWarning: false,
    };
  }
  async onRequestSMSCode() {
    if (!this.refs.phone.value ||
      this.refs.phone.value.length !== 11) {
      this.refs.phone.focus();
      this.setState({
        phoneWarning: true
      });
      return;
    }
    this.setState({
      count: 60,
      phoneWarning: false,
    });
    let interval = setInterval(() => {
      const count = this.state.count - 1;
      if (count < 0) {
        clearInterval(interval);
      }
      this.setState({count});
    }, 1000);
    // change
    const data = await client.user.smsRequest(this.refs.phone.value);
    console.log(data);
  }
  async onLogin() {
    const newState = this.state;
    if (!this.refs.phone.value ||
      this.refs.phone.value.length !== 11) {
      newState.phoneWarning = true;
    } else {
      newState.phoneWarning = false;
    }
    if (!this.refs.smscode.value ||
      this.refs.smscode.value.length !== 4) {
      newState.smscodeWarning = true;
    } else {
      newState.smscodeWarning = false;
    }
    if (!newState.phoneWarning && !newState.smscodeWarning) {
      const data = await client.user.smsLogin(
        this.refs.phone.value, this.refs.smscode.value);
      console.log(data);
      window.location.href = '/calendar';
    }
    this.setState(newState);
  }
  onPhoneInputChange(event) {
    if (this.state.phoneWarning && event.target.value.length === 11) {
      this.setState({
        phoneWarning: false
      });
    }
  }
  render() {
    let getSMSCode;
    if (this.state.count < 0) {
      getSMSCode = <button className="get-smscode" onClick={this.onRequestSMSCode.bind(this)}>获取验证码</button>;
    } else {
      getSMSCode = <div className="get-smscode disabled">等待({this.state.count})</div>;
    }
    let phoneClassName = 'login-row phone';
    if (this.state.phoneWarning) {
      phoneClassName += ' warning';
    }
    let smscodeClassName = 'login-row smscode';
    if (this.state.smscodeWarning) {
      smscodeClassName += ' warning';
    }
    return (
      <div className="login-smscode">
        <div className={phoneClassName}>
          <input 
            type="text" 
            ref="phone" 
            onChange={this.onPhoneInputChange.bind(this)} 
            placeholder="输入手机号" 
          />
          {getSMSCode}
        </div>
        <div className={smscodeClassName}>
          <input type="text" ref="smscode" placeholder="输入验证码" />
        </div>
        <div className="login-row">
          <button className="login-btn" onClick={this.onLogin.bind(this)}>登录</button>
        </div>
      </div>
    );
  }
}

module.exports = TabSMSCode;
