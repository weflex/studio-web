"use strict";

import React from 'react';
import UIFramework from '@weflex/weflex-ui';
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
    const {username, password} = this.state.form;
    await client.user.login(username, password);
    alert(1)
    await client.user.getCurrent();
    alert(2)
    window.location.href = '/calendar';
  }
  render() {
    return (
      <UIFramework className="login-smscode">
        <UIFramework.Row className="login-row username">
          <UIFramework.TextInput
            flex={1} 
            bindStateCtx={this}
            bindStateName="form.username"
            placeholder="输入用户名" 
          />
        </UIFramework.Row>
        <UIFramework.Row className="login-row password">
          <UIFramework.TextInput
            flex={1} 
            bindStateCtx={this}
            bindStateName="form.password"
            password={true}
            placeholder="输入密码" 
          />
        </UIFramework.Row>
        <UIFramework.Row className="login-row">
          <UIFramework.Button 
            flex={1}
            onClick={this.onLogin.bind(this)} 
            text="登录" 
            block={true} 
            level="primary" 
            disabled={!(this.state.form.password && this.state.form.username)}
          />
        </UIFramework.Row>
      </UIFramework>
    );
  }
}

module.exports = TabUserPass;
