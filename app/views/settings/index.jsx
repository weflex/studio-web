"use strict"

import React from 'react';
import MasterDetail from '../../components/master-detail';
import './index.css';

class SettingsIndex extends React.Component {
  constructor(props) {
    super(props);
  }
  get title() {
    return '场馆设置';
  }
  get actions() {
    return [];
  }
  settings() {
    return [
      {
        id: 'profile',
        title: '个人信息',
        component: require('./tabs/profile'),
      },
      {
        id: 'basic',
        title: '基本信息',
        component: require('./tabs/basic')
      },
      {
        id: 'venue',
        title: '门店信息',
        component: require('./tabs/venue')
      },
      {
        id: 'team',
        title: '团队管理',
        component: require('./tabs/team')
      }
    ];
  }
  render() {
    return (
      <MasterDetail
        pathname="/settings"
        className="settings"
        masterSource={this.settings}
      />
    );
  }
}

module.exports = SettingsIndex;