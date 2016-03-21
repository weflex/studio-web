"use strict";

import React from 'react';
import {
  TextInput,
  TextButton,
} from '../../components/form';
import { client } from '../../api';

class TabUserPass extends React.Component {
  static title = '用户名密码登录';
  constructor(props) {
    super(props);
    this.state = {
      form: {
        username: '',
        password: '',
      },
    };
  }
  async onLogin() {
    try {
      await client.user.login(
        this.state.form.username,
        this.state.form.password);
      window.location.href = '/calendar';
    } catch (err) {
      alert(err && err.message);
    }
  }
  render() {
    return (
      <div className="login-smscode">
        <div className="login-row username">
          <TextInput 
            bindStateCtx={this}
            bindStateName="form.username"
            placeholder="输入用户名" 
          />
        </div>
        <div className="login-row password">
          <TextInput 
            bindStateCtx={this}
            bindStateName="form.password"
            password={true}
            placeholder="输入密码" 
          />
        </div>
        <div className="login-row">
          <TextButton 
            onClick={this.onLogin.bind(this)} 
            text="登录" 
            block={true} 
            level="primary" 
          />
        </div>
      </div>
    );
  }
}

module.exports = TabUserPass;
