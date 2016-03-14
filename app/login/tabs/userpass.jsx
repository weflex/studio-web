"use strict";

import React from 'react';
import { client } from '../../api';

class TabUserPass extends React.Component {
  static title = '用户名密码登录';
  static disabled = process.env.GIAN_GATEWAY !== 'test';
  async onLogin() {
    try {
      await client.user.login(
        this.refs.username.value,
        this.refs.password.value);
      window.location.href = '/calendar';
    } catch (err) {
      alert(err && err.message);
    }
  }
  render() {
    return (
      <div className="login-smscode">
        <div className="login-row username">
          <input type="text" ref="username" placeholder="输入用户名" />
        </div>
        <div className="login-row password">
          <input type="password" ref="password" placeholder="输入密码" />
        </div>
        <div className="login-row">
          <button className="login-btn" onClick={this.onLogin.bind(this)}>登录</button>
        </div>
      </div>
    );
  }
}

module.exports = TabUserPass;
