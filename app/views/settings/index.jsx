"use strict"

import React from 'react';
import MasterDetail from '../../components/master-detail';
import './index.css';

class SettingsIndex extends React.Component {
  constructor(props) {
    super(props);
  }
  settings() {
    return [
      {
        title: '基本信息',
        pathname: '/basic',
        component: require('./components/basic')
      },
      {
        title: '门店信息',
        pathname: '/venue',
        component: require('./components/venue')
      },
      {
        title: '团队设置',
        pathname: '/team',
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