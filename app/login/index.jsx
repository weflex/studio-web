"use strict";

import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { client } from '../api';
import '../layout/root-center.css';
import './index.css';
import UIFramework from '@weflex/weflex-ui';
const queryString = require('query-string');

const sourceTabs = [
  // require('./tabs/smscode'),
  // require('./tabs/qrcode'),
  require('./tabs/userpass'),
];

class LoginIndex extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
    };
  }
  async componentWillMount() {
    await client.user.logout();  
  }
  onSelect(key) {
    this.setState({
      selected: key
    });
  }
  componentDidMount() {
    const query = queryString.parse(location.search);
    if (query.msg) {
      let errorMessage;
      switch(query.msg){
        case '401':
        errorMessage = '该账户不存在，请联系客服人员';
        break;
        case 'login failed':
        errorMessage = '账号或密码错误，请重新登录';
        break;
        default:
        errorMessage = '登录错误导致登录失败';
        break;
      }
      UIFramework.Modal.error({
        title: '登录失败',
        content: errorMessage,
        onOk: () => window.location.href = '/login'
      });
    }
  }
  render() {
    let tabs = [];
    let content;
    sourceTabs.forEach((component, key) => {
        let className;
        if (key === this.state.selected) {
          className = 'selected';
          content = React.createElement(component);
        }
        tabs.push(
          <li key={key} 
            className={className} 
            onClick={this.onSelect.bind(this, key)}>
            {component.title}
          </li>
        );
    });
    return (
      <div className="box-container">
        <div className="box login">
          <ul className="tabs">{tabs}</ul>
          <div className="contents">
            {content}
          </div>
          <p className="login-link">还没有账号？点击<a href="/signup">这里注册</a></p>
        </div>
      </div>
    );
  }
}

(function () {
  ReactDOM.render(
    <LoginIndex />,
    document.getElementById('root-container'));
})();