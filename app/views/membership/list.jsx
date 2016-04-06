"use strict";

import React from 'react';
import moment from 'moment';
import MasterDetail from '../../components/master-detail';
import Detail from './detail';
import AddMembershipView from './add';
import UIFramework from 'weflex-ui';
import { UIProfileListItem } from '../../components/ui-profile';
import { client } from '../../api';
moment.locale('zh-cn');

function groupUserByPackage(packages) {
  const users = [];
  const usersIndex = {};
  for (let _package of packages) {
    for (let membership of _package.memberships) {
      let {userId} = membership;
      let currIndex;
      if (usersIndex[userId] === undefined) {
        users.push(Object.assign({
          memberships: [],
          title: membership.user.nickname,
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

class List extends React.Component {
  static styles = {
    master: {
      nickname: {
        display: 'inline-block',
        maxWidth: '80%',
        overflowX: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      count: {
        display: 'inline-block',
        verticalAlign: 'top',
        marginLeft: '5px',
      },
    },
  };
  constructor(props) {
    super(props);
    this.state = {
      modalVisibled: false,
    };
  }
  get title() {
    return '会员管理';
  }
  get actions() {
    return [
      {
        title: '邀请新会员',
        onClick: this.viewModal.bind(this),
      }
    ];
  }
  get config() {
    return {
      title: 'title',
      search: ['title', 'phone'],
      master: (user, index) => {
        const header = (
          <p title={user.nickname}>
            <span style={List.styles.master.nickname}>
              {user.nickname}
            </span>
            <span style={List.styles.master.count}>
              ({user.memberships.length})
            </span>
          </p>
        );
        return (
          <UIProfileListItem avatar={user.avatar} 
            header={header}>
            {user.phone}
          </UIProfileListItem>
        );
      },
      detail: {
        component: Detail
      },
      iterated: true,
      sortKeys: [
        {name: '姓名', key: 'nickname'},
      ],
      onClickAdd: this.viewModal.bind(this),
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
    const users = groupUserByPackage(packages);
    this.props.app.title(`${this.title}（${users.length}）`);
    return users;
  }
  viewModal() {
    this.setState({
      modalVisibled: true,
    });
  }
  hideModal() {
    this.setState({
      modalVisibled: false,
    });
  }
  async onCompleteAddMembership() {
    this.hideModal()
    await this.refs.masterDetail.updateMasterSource();
  }
  render() {
    return (
      <div style={{height: '100%'}}>
        <MasterDetail 
          ref="masterDetail"
          pathname="membership"
          className="membership"
          masterSource={this.source.bind(this)}
          masterConfig={this.config}
        />
        <UIFramework.Modal 
          visible={this.state.modalVisibled}
          onCancel={this.hideModal.bind(this)}
          title="邀请新会员"
          footer="">
          <AddMembershipView 
            onComplete={this.onCompleteAddMembership.bind(this)}
          />
        </UIFramework.Modal>
      </div>
    );
  }
}

module.exports = List;
