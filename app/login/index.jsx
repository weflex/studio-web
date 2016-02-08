"use strict";

import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import QRCode from 'qrcode.react';
import {
  Form,
  Row,
  TextInput,
  TextButton
} from '../components/form';
import { WeChatProvider } from '@weflex/passport.js';
import { client } from '../api';
import './index.css';

const wechat = new WeChatProvider({
  appid: 'wx1ba55acac2fd5884',
  secret: '57cb056bcfe74dba0920237345c08c62',
  scope: 'snsapi_userinfo',
  redirectUri: encodeURIComponent(
    'http://api.theweflex.com/auth/wechat/callback')
});

class Login extends React.Component {
  constructor(props) {
    super();
    this.state = {
      data: {},
      url: location.href,
      current: 'userpass',
      selects: [
        {
          id: 'userpass',
          hint: '使用用户名/密码',
          view: () => {
            return (
              <Form className="userpass-container">
                <Row name="用户名" required={true}>
                  <TextInput 
                    bindStateCtx={this}
                    bindStateName="data.username"
                  />
                </Row>
                <Row name="密码" required={true}>
                  <TextInput
                    password={true}
                    bindStateCtx={this}
                    bindStateName="data.password"
                  />
                </Row>
                <Row>
                  <TextButton text="登陆" 
                    disabled={this.canLogin}
                    onClick={this.onUserPassLogin.bind(this)} 
                  />
                </Row>
              </Form>
            );
          }
        },
        {
          id: 'qrcode',
          hint: '使用二维码',
          view: () => {
            return (
              <div className="qrcode-container">
                <QRCode value={this.state.url} size={170} />
              </div>
            );
          }
        }
      ]
    };
  }
  componentWillMount() {
    client.user.logout();
  }
  componentDidMount() {
    client.user.pending(
      this.ongetCode.bind(this),
      this.onlogged.bind(this)
    );
  }
  ongetCode(code) {
    const state = btoa('redirect:https://weflex-api-dev.herokuapp.com/webhook/login/success?code=' + code);
    const url = wechat.getUrlForCode(state);
    this.setState({ url });
  }
  onlogged() {
    window.location.href = '/';
  }
  get canLogin() {
    return !(this.state.data.username &&
      this.state.data.password);
  }
  async onUserPassLogin() {
    const data = this.state.data;
    await client.user.login(
      data.username, data.password);
    window.location.href = '/calendar';
  }
  renderSelectButton(select, index) {
    let className;
    if (this.state.current === select.id) {
      className = 'active';
    }
    return (
      <li key={index} className={className} onClick={() => {
        this.setState({current: select.id});
      }}>
        {select.hint}
      </li>
    );
  }
  render() {
    let loginView;
    for (let select of this.state.selects) {
      if (select.id === this.state.current) {
        loginView = select.view.call(this);
        break;
      }
    }
    return (
      <div className="login-view">
        <header>登陆WeFlex</header>
        <section>
          <ul className="login-menu">
            {this.state.selects.map(
              this.renderSelectButton.bind(this)
            )}
          </ul>
          <div className="login-content">
            {loginView}
          </div>
        </section>
      </div>
    );
  }
}

(function () {
  ReactDOM.render(
    <Login />,
    document.getElementById('root-container'));
})();
