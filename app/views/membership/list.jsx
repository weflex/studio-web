"use strict";

import React from 'react';
import moment from 'moment';
import MasterDetail from '../../components/master-detail';
import ListView from '../../components/list-view';
import Detail from './detail';
import AddMembershipView from './add';
import { UIProfileListItem } from '../../components/ui-profile';
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
      master: (user, index) => {
        return (
          <UIProfileListItem avatar={user.avatar} 
            header={`${user.nickname} (${user.memberships.length})`}>
            {user.phone}
          </UIProfileListItem>
        );
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
            'package',
          ],
        },
      ],
    });
    const users = [];
    const usersIndex = {};
    for (let _package of packages) {
      for (let membership of _package.memberships) {
        let {userId} = membership;
        let currIndex;
        if (usersIndex[userId] === undefined) {
          users.push(Object.assign({
            memberships: [],
          }, membership.user));
          usersIndex[userId] = users.length - 1;
          currIndex = usersIndex[userId];
        }
        if (currIndex === undefined) {
          currIndex = usersIndex[userId];
        }
        users[currIndex].memberships.push(membership);
      }
    }
    return users;
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
