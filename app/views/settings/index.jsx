"use strict"

import React from 'react';
import Venue from './tabs/newVenue';
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
      // {
      //   id: 'profile',
      //   title: '个人信息',
      //   component: require('./tabs/profile'),
      // },
      {
        id: 'basic',
        title: '基本信息',
        component: require('./tabs/basic'),
      },
      {
        id: 'venue',
        title: '场馆设置',
        component: require('./tabs/newVenue')
      },
    ];
  }
  render() {
    return (
      <Venue />
    );
  }
}

module.exports = SettingsIndex;