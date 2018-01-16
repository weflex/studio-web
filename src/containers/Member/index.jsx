import './index.css';
import React from 'react';
import UIFramework from '@weflex/weflex-ui';
import ListDetail from '../../components/list-detail';
import Detail from './detail';
import Importer from './importer';
import ViewToAddMember from './add-member';
import { UIProfileListItem } from '../../components/ui-profile';
import { startOfToday, endOfToday } from 'date-fns';
import { client } from '../../util/api';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';

class MemberViewInjected extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      filter: '',
      members: [],
      sortList: [{
        text: props.intl.formatMessage({id: 'studio_web_member_sort_order_by_name_asc'}),
        value: 'nickname ASC',
      }, {
        text: props.intl.formatMessage({id: 'studio_web_member_sort_order_by_name_desc'}),
        value: 'nickname DESC',
      }, {
        text: props.intl.formatMessage({id: 'studio_web_member_sort_order_by_created_at_asc'}),
        value: 'createdAt ASC',
      }, {
        text: props.intl.formatMessage({id: 'studio_web_member_sort_order_by_created_at_desc'}),
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
    return <FormattedMessage id="studio_web_member_page_title"
                             values={{
                               loading: <FormattedMessage id="studio_web_loading"/>
                             }}/>;
  }

  get actions() {
    const { intl } = this.props;
    return [
      {
        title: intl.formatMessage({id: "studio_web_member_btn_invite_new_members"}),
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
    if(memberCount > 0) {
      this.setState({showImporter: false});
    }
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
    const memberList = ( await client.member.list({
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
    }) ).map(item => {
      item.avatarURL = item.avatar && item.avatar.uri;
      item.title = item.nickname;
      item.label = ` (${item.memberships.length})`;
      item.description = item.phone;
      return item;
    });

    members = skip !== 0? members.concat(memberList): memberList;

    this.props.app.title(<FormattedMessage id="studio_web_member_page_title"
                             values={{
                               loading: `${members.length}`
                             }}/>);
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
          title={<FormattedMessage id="studio_web_member_modal_add_member_title"/>}
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

MemberViewInjected.propTypes = {
  intl: intlShape.isRequired,
}

const MemberView = injectIntl(MemberViewInjected, { withRef: true });

module.exports = MemberView;
