"use strict";

import React from 'react';
import moment from 'moment';
import MasterDetail from '../../components/master-detail';
import ListView from '../../components/list-view';
import Detail from './detail';
import AddMembershipView from './add';
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
        onClick: this.onViewAddMembership.bind(this),
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
      onClickAdd: this.onViewAddMembership.bind(this),
      addButtonText: '邀请新会员',
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
  onViewAddMembership() {
    this.refs.addMembershipModal.show();
  }
  async onCompleteAddMembership() {
    this.refs.addMembershipModal.hide();
    await this.refs.masterDetail.updateMasterSource();
  }
  render() {
    return (
      <div style={{height: '100%'}}>
        <MasterDetail 
          ref="masterDetail"
          pathname="membership"
          className="membership"
          masterSource={this.source}
          masterConfig={this.config}
        />
        <DropModal ref="addMembershipModal">
          <AddMembershipView 
            onComplete={this.onCompleteAddMembership.bind(this)}
          />
        </DropModal>
      </div>
    );
  }
}

module.exports = List;
