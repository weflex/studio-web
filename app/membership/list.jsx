"use strict";

import React from 'react';
import ListView from '../list-view';
import QRCode from 'qrcode.react';
import {
  DropModal
} from 'boron';
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
        title: '会员姓名',
        display: o => o.user.username
      },
      {
        title: '会员电话',
        display: o => o.user.phone
      },
      {
        title: '加入时间',
        sortBy: o => o.createdAt,
        display: o => moment(o.createdAt).format('lll')
      },
      {
        title: '加入场馆',
        display: o => o.venue.name
      }
    ];
  }
  get title() {
    return '会员管理';
  }
  get actions() {
    return [
      {
        title: '邀请新会员',
        onClick: () => {
          this.refs.inviteNewMemberModal.show();
        }
      }
    ];
  }
  renderView(data) {
    return (
      <div className="list-view">
        <div className="list-view-header">会员信息</div>
        <div className="list-view-content">
          <div className="list-view-fieldset list-view-fieldset-right">
            <img className="list-view-avatar" src={data.user.avatarUrl} />
          </div>
          <div className="list-view-fieldset">
            <label>姓名</label>
            <span>{data.user.nickname}</span>
          </div>
          <div className="list-view-fieldset">
            <label>位置</label>
            <span>{data.user.city},{data.user.country}</span>
          </div>
          <div className="list-view-fieldset">
            <label>联系电话</label>
            <span>{data.user.phone}</span>
          </div>
          <div className="list-view-blank"></div>
          <div className="list-view-fieldset">
            <label>加入场馆</label>
            <span>{data.venue.name}</span>
          </div>
          <div className="list-view-fieldset">
            <label>场馆地址</label>
            <span>{data.venue.address}</span>
          </div>
          <div className="list-view-fieldset">
            <label>加入时间</label>
            <span>{moment(data.createdAt).calendar()}</span>
          </div>
        </div>
        <div className="list-view-footer">
        </div>
      </div>
    );
  }
  render() {
    return (
      <div>
        <ListView
          dataSource={async () => {
            return await client.membership.list({
              include: ['user', 'venue']
            });
          }}
          renderView={this.renderView}
          rows={this.rows} 
        />
        <DropModal ref="inviteNewMemberModal" contentStyle={{
          padding: 10,
          textAlign: 'center'
        }}>
          <h2>邀请新会员</h2>
          <div style={{margin: 20}}>
            <QRCode value="weflex://join" size={150} />
            <p>使用WeFlex扫码加入</p>
          </div>
        </DropModal>
      </div>
    );
  }
}

module.exports = OrderList;
