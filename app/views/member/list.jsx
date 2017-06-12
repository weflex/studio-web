"use strict";

import React from 'react';
import UIFramework from '@weflex/weflex-ui';
import MasterDetail from '../../components/master-detail';
import Detail from './detail';
import Importer from './importer';
import ViewToAddMember from './add-member';
import { UIProfileListItem } from '../../components/ui-profile';
import { client } from '../../api';
import {startOfDay, endOfDay} from 'date-fns';
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
      showImporter: false,
    };
  }
  get title() {
    return '会员管理（加载中...）';
  }
  get actions() {
    return [
      {
        title: '邀请新会员',
        onClick: this.viewModal.bind(this),
        disableToggled: true,
      }
    ];
  }
  get search() {
    return this.refs
      .masterDetail
      .onSearchInputChange
      .bind(this.refs.masterDetail);
  }
  get config() {
    return {
      title: 'title',
      keywords: ['nickname', 'phone'],
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
  async getMembers() {
    const today = new Date();
    const venue = await client.user.getVenueById();
    return await client.member.list({
      where: {
        venueId: venue.id,
      },
      include: [
        {
          relation: 'checkIns',
          scope:{
            where: {
              timestamp: {
                between: [startOfDay(today), endOfDay(today)]
              }
            }
          }
        },
        {
          relation: 'memberships',
          scope: {
            where: {
              trashedAt: {
                exists: false
              }
            }
          }
        },
        'avatar'
      ],
    });
  }
  async source() {
    this.members = await this.getMembers();
    this.props.app.title(`会员管理（${this.members.length}）`);
    return this.members;
  }
  async componentDidMount() {
    const venueId = ( await client.user.getVenueById() ).id;
    const memberCount = ( await client.member.count({
      where: {
        venueId,
        trashedAt: {
          exists: false
        }
      }
    }) ).count;

    this.setState({
      showImporter: !memberCount,
    });
  }
  componentWillUnmount() {
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
  async onAddMemberDone() {
    await this.refs.masterDetail.updateMasterSource();
    this.hideModal();
  }
  render() {
    return (
      <div style={{height: '100%'}}>
        {this.state.showImporter ? <Importer />:<MasterDetail
          ref="masterDetail"
          pathname="member"
          className="membership"
          masterSource={this.source.bind(this)}
          masterConfig={this.config}
        />}
        <UIFramework.Modal 
          visible={this.state.modalVisibled}
          onCancel={this.hideModal.bind(this)}
          title="邀请新会员"
          footer=""
        >
          <ViewToAddMember
            onComplete={this.onAddMemberDone.bind(this)}
          />
        </UIFramework.Modal>
      </div>
    );
  }
}

module.exports = List;
