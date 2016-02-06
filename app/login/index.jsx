"use strict";

import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import QRCode from 'qrcode.react';
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
      url: location.href
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
    location.href = '/';
  }
  render() {
    return (
      <div className='login-view'>
        <h1>WeFlex</h1>
        <div className='hint'>扫描二维码登录</div>
        <div id='qrcode-container'>
          <QRCode value={this.state.url} size={170} />
        </div>
      </div>
    );
  }
}

(function () {
  ReactDOM.render(
    <Login />,
    document.getElementById('root-container'));
})();
