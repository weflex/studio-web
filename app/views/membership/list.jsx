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
      },
      include: [
        {
          'memberships': [
            {
              'user': ['avatar']
            },
          ],
        },
      ],
    });
    return packages.reduce((memberships, _package) => {
      (_package.memberships || []).forEach((item) => {
        const membership = Object.assign({
          'title': item.user.nickname,
          'package': _package,
          'packageId': _package.id,
        }, item);
        memberships.push(membership);
      });
      return memberships;
    }, []);
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
