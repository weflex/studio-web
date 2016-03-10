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
      sortKeys: [
        {name: '姓名', key: 'user.nickname'},
        {name: '卡种', key: 'classPackage.name'},
      ],
      onClickAdd: 'membership/add',
      addButtonText: '添加新用户',
    };
  }
  async source() {
    const venue = await client.user.getVenueById();
    const packages = await client.classPackage.list({
      where: {
        venueId: venue.id
      }
    });
    const list = await client.membership.list({
      where: {
        packageId: {
          inq: packages.map((pkg) => pkg.id),
        }
      },
      include: [
        {
          'user': ['avatar']
        },
        'package'
      ]
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
