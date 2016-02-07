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
  settings() {
    return [
      {
        id: 'basic',
        title: '基本信息',
        component: require('./components/basic')
      },
      {
        id: 'venue',
        title: '门店信息',
        component: require('./components/venue')
      },
      {
        id: 'team',
        title: '团队设置',
        component: require('./components/team')
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