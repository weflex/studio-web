"use strict";

import React from 'react';
import moment from 'moment';
import MasterDetail from '../../components/master-detail';
import ListView from '../../components/list-view';
import Detail from './detail';
import QRCode from 'qrcode.react';
import { DropModal } from 'boron';
import { SearchInput } from '../../components/toolbar/components/search';
import { client } from '../../api';
moment.locale('zh-cn');

class List extends React.Component {
  get title() {
    return '用户管理';
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
  get config() {
    return {
      title: 'title',
      section: (item) => {
        return [
          <div key={0}>{item.user.phone}</div>,
          <div key={1}>{item.package.name}</div>
        ];
      },
      detail: {
        component: Detail
      },
      iterated: true,
      onClickAdd: 'membership/add',
      addButtonText: '添加新用户',
    };
  }
  async source() {
    let venue = await client.org.getSelectedVenue();
    let list = await client.membership.list({
      where: {
        venueId: venue.id
      },
      include: ['user', 'package']
    });
    return (list || []).map((item) => {
      item.title = item.user.nickname;
      return item;
    });
  }
  render() {
    return (
      <MasterDetail 
        pathname="membership"
        className="membership"
        masterSource={this.source}
        masterConfig={this.config}
      />
    );
  }
}

module.exports = List;
