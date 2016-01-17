"use strict";

import React from 'react';
import ListView from '../list-view';
import {
  SearchInput
} from '../toolbar/components/search';

const moment = require('moment');
const client = require('@weflex/gian').getClient('dev');
moment.locale('zh-cn');

class OrderList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.rows = [
      {
        title: '订单时间',
        sortBy: o => o.created,
        display: o => moment(o.created).format('lll')
      },
      {
        title: '卡种选择',
        sortBy: o => o.classPackage && o.classPackage.name,
        display: o => o.classPackage && o.classPackage.name
      },
      {
        title: '客户',
        sortBy: o => o.user.username,
        display: o => o.user.username
      },
      {
        title: '有效期',
        sortBy: o => o.classPackage && o.classPackage.expiredAt,
        display: o => moment(o.classPackage.expiredAt).format('lll')
      }
    ];
  }
  get title() {
    return '订单管理';
  }
  get actions() {
    return [];
  }
  renderView(data) {
    return (
      <div className="list-view">
        <div className="list-view-header">订单详情</div>
        <div className="list-view-content">
          <div className="list-view-fieldset">
            <label>订单时间</label>
            <span>{moment(data.created).format('lll')}</span>
          </div>
          <div className="list-view-fieldset">
            <label>卡种类型</label>
            <span>{data.classPackage.name}</span>
          </div>
          <div className="list-view-fieldset">
            <label>有效期</label>
            <span>{moment(data.classPackage.expiredAt).format('lll')}</span>
          </div>
          <div className="list-view-fieldset">
            <label>使用次数</label>
            <span>{data.classPackage.passes}次</span>
          </div>
          <div className="list-view-fieldset">
            <label>剩余次数</label>
            <span>1次</span>
          </div>
          <div className="list-view-fieldset">
            <label>客户</label>
            <span>{data.user.nickname}</span>
          </div>
          <div className="list-view-fieldset">
            <label>付款方式</label>
            <span>支付宝</span>
          </div>
          <div className="list-view-fieldset">
            <label>金额</label>
            <span>300元人民币</span>
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
          return await client.order.list({
            include: ['classPackage', 'user']
          });
        }}
        renderView={this.renderView}
        rows={this.rows} 
      />
    );
  }
}

module.exports = OrderList;
