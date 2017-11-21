import './index.css';
import React from 'react';
import UIFramework from '@weflex/weflex-ui';
import ListDetail from '../../components/list-detail';
import Detail from './detail';
import Importer from './importer';
import ViewToAddMember from './add-member';
import { UIProfileListItem } from '../../components/ui-profile';
import { startOfToday, endOfToday } from 'date-fns';
import { client } from '../../api';

class MemberView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      filter: '',
      members: [],
      sortList: [{
        text: '按照姓名正序',
        value: 'nickname ASC',
      }, {
        text: '按照姓名倒序',
        value: 'nickname DESC',
      }, {
        text: '按照添加时间正序',
        value: 'createdAt ASC',
      }, {
        text: '按照添加时间倒序',
        value: 'createdAt DESC',
      }],
      sortBy: 'nickname ASC',
      isEnd: false,
      skip: 0,
      showMemberInfo: false,
      showImporter: true,
    };
    this.cache = {
      venueId: '',
      limit: 50,
    }
    this.updateMembers = this.updateMembers.bind(this);
  }

  get title() {
    return '会员管理（加载中...）';
  }

  get actions() {
    return [
      {
        title: '邀请新会员',
        onClick: this.addNewMember.bind(this),
        disableToggled: true,
      }
    ];
  }

  addNewMember() {
    mixpanel.track( "会员：邀请新会员");
    this.setState({ showMemberInfo: true });
  }

  get search() {
    return value => {
      let { searchAction } = this.cache;
      if(searchAction) { clearTimeout(searchAction); }
      this.cache.searchAction = setTimeout( ()=>{
        this.setState({
          filter: value.replace(/^\s+|\s+$/g, ''),
          skip: 0,
        }, this.updateMembers);
      }, 500);
    }
  }

  async componentDidMount() {
    this.cache.venueId = ( await client.user.getVenueById() ).id;
    const memberCount = ( await client.member.count({ 
      where: {
        venueId: this.cache.venueId,
        trashedAt: { exists: false }
      }
    }) ).count;
    this.setState({showImporter: false});
    this.updateMembers();
  }

  async updateMembers() {
    const { venueId, limit } = this.cache;
    let { skip, filter, members, sortBy } = this.state;
    let where = {
      venueId,
      trashedAt: { exists: false },
    };
    if(filter) {
      where.or = [
        { phone: {like: filter} },
        { nickname: {like: filter} },
      ]
    };
    const memberCount = ( await client.member.count({ where }) ).count;
    const memberList = await client.member.list({
      where,
      include: [
        'user',
        'avatar',
        {
          relation: 'checkIns',
          scope:{
            where: {
              timestamp: {
                between: [startOfToday(), endOfToday()]
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
      ],
      limit,
      skip,
      order: sortBy,
    });
    
    members = skip !== 0? members.concat(memberList): memberList;
    this.props.app.title(`会员管理（${members.length}）`);
    this.setState({
      skip: skip + limit,
      members,
      isEnd: members.length === memberCount,
    });
  }

  hideMemberInfo() {
    this.setState({ showMemberInfo: false, });
  }

  async onAddMemberDone() {
    this.setState({ showMemberInfo: false, showImporter: false, skip: 0, sortBy: 'createdAt DESC'}, this.updateMembers);
  }

  render() {
    const { members, sortList, sortBy, isEnd, skip, showMemberInfo, showImporter, } = this.state;

    return (
      <div className="member-view" style={{height: '100%'}}>
        {
          showImporter
            ? <Importer />
            : <ListDetail
                data={members}
                onLoadMore={this.updateMembers}
                sortList={sortList}
                sortBy={sortBy}
                onSortChange={ value => { this.setState({sortBy: value.target.value, skip: 0}, this.updateMembers) } }
                isEnd={isEnd}
                detailComponent={Detail}
                onRefresh={ () => {this.setState({ skip: 0 }, this.updateMembers)} }
              />
        }

        <UIFramework.Modal 
          visible={showMemberInfo}
          onCancel={() => {this.setState({ showMemberInfo: false });}}
          onClick={() => { mixpanel.track( "会员：邀请新会员" ); }}
          title="邀请新会员"
          footer=""
        >
          <ViewToAddMember
            type="add"
            memberId=""
            onComplete={this.onAddMemberDone.bind(this)}
          />
        </UIFramework.Modal>
      </div>
    );
  }
}

module.exports = MemberView;
