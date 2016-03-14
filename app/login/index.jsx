"use strict";

import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { client } from '../api';
import './index.css';

const sourceTabs = [
  require('./tabs/smscode'),
  require('./tabs/qrcode'),
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
  render() {
    let tabs = [];
    let content;
    sourceTabs.forEach((component, key) => {
      if (!component.disabled) {
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
      }
    });
    return (
      <div className="login-container">
        <div className="login">
          <ul className="tabs">{tabs}</ul>
          <div className="contents">
            {content}
          </div>
          <p className="login-link">还没有账号？点击这里注册</p>
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