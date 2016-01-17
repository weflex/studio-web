"use strict";

import React from 'react';
import ListView from '../list-view';
import {
  SearchInput
} from '../toolbar/components/search';

const moment = require('moment');
const client = require('@weflex/gian').getClient('dev');
moment.locale('zh-cn');

class TrainerList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.rows = [
      {
        title: '姓名',
        sortBy: o => o.user.username,
        display: o => o.user.username
      },
      {
        title: '语言',
        sortBy: o => o.languages[0],
        display: o => o.languages
      },
      {
        title: '描述',
        sortBy: o => o.description,
        display: o => o.description
      },
      {
        title: '联系电话',
        sortBy: o => o.user.phone,
        display: o => o.user.phone
      }
    ];
  }
  get title() {
    return '教练管理';
  }
  get actions() {
    return [
      {
        title: '邀请新教练',
        path: '/trainer/add'
      }
    ];
  }
  renderView(data) {
    return (
      <div className="list-view">
        <div className="list-view-header">教练信息</div>
        <div className="list-view-content">
          <div className="list-view-fieldset list-view-fieldset-right">
            <img className="list-view-avatar" src={data.user.avatarUrl} />
          </div>
          <div className="list-view-fieldset">
            <label>教练姓名</label>
            <span>
              {data.fullname.last} {data.fullname.first}
            </span>
          </div>
          <div className="list-view-fieldset">
            <label>语言</label>
            <span>{data.languages}</span>
          </div>
          <div className="list-view-fieldset">
            <label>城市</label>
            <span>
              {data.user.city}
            </span>
          </div>
          <div className="list-view-fieldset">
            <label>电子邮件</label>
            <span>
              <a href={`mailto:${data.user.email}`}>
                {data.user.email}
              </a>
            </span>
          </div>
        </div>
        <div className="list-view-footer">
        </div>
      </div>
    );
  }
  render() {
    return (
      <ListView
        dataSource={async () => {
          return await client.trainer.list({
            include: ['user']
          });
        }}
        renderView={this.renderView}
        rows={this.rows} 
      />
    );
  }
}

module.exports = TrainerList;
