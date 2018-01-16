import './index.css';
import { flattenDeep } from 'lodash';
import React from 'react';
import UIFramework from '@weflex/weflex-ui';
import MasterDetail from '../../components/master-detail';
import UIMembershipCard from '../../components/ui-membership-card';
import { UIHistory } from '../../components/ui-history';
import ViewToAddMember from './add-member';
import ViewToAddMembership from './add-membership';
import { client } from '../../util/api';

import { format, compareDesc } from 'date-fns';
import { keyBy } from 'lodash';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';

class UserProfileCardInjected extends React.Component {
  static propTypes = {
    /**
     * @property {String} id - the member object id
     */
    id: React.PropTypes.string,
    /**
     * @property {Object} avatar - the member avatar object
     */
    avatar: React.PropTypes.object,
    /**
     * @property {String} nickname - the nickname
     */
    nickname: React.PropTypes.string,
    /**
     * @property {String} phone - the phone number of this member
     */
    phone: React.PropTypes.string,
    /**
     * @property {String} email - the email address of this member
     */
    email: React.PropTypes.string,
    /**
     * @property {Detail} context - the `Detail` object to be a context of this module
     */
    context: React.PropTypes.object,
    /**
     * @property {Object} intl - react internationalization
     */
    intl: intlShape.isRequired,
  };

  /**
   * @constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      modalVisibled: false,
      uptoken: null,
      checkIns:props.checkIns,
    };
  }

  /**
   * @method componentWillMount
   * @async
   */
  async componentWillMount() {
    const venue = await client.user.getVenueById();
    const token = await client.resource.token();
    this.setState({
      uptoken: token.uptoken,
    });
  }

  /**
   * @property {Array} actions - the buttons on the right top of this card
   */
  get actions() {
    const { intl } = this.props;
    let actions = [];
    actions.push(
      <a key="edit" onClick={this.onEdit.bind(this)}>
        {intl.formatMessage({id: 'studio_web_member_detail_actions_edit_member'})}
      </a>,
      <a key="dele" onClick={this.onDelete.bind(this)}>
        {intl.formatMessage({id: 'studio_web_member_detail_actions_delete_member'})}
      </a>
    )
    if (this.state.checkIns.length == 0) {
      actions.unshift(<a key="chenkIns" onClick={this.createCheckIn.bind(this)}>
        {intl.formatMessage({id: 'studio_web_member_detail_actions_check_in_member'})}
      </a>)
    }
    return actions;
  }

  onEdit() {
    this.setState({
      modalVisibled: true,
    });
    mixpanel.track( "会员详情：编辑会员" );
  }

  onDelete() {
    mixpanel.track( "会员详情：删除会员" );
    const { id, modifiedAt, nickname, onCompleteRefresh, intl } = this.props;
    UIFramework.Modal.confirm({
      title: intl.formatMessage({id: 'studio_web_member_detail_modal_delete_title'}) + nickname,
      content: intl.formatMessage({id: 'studio_web_member_detail_modal_delete_content'}),
      onOk: async () => {
        if (id) {
          await client.member.delete(id, modifiedAt);
          //await props.context.props.updateMaster();
          UIFramework.Message.success(intl.formatMessage({id: 'studio_web_member_detail_modal_delete_success'}) + nickname);
          onCompleteRefresh();
        } else {
          // TODO(Yorkie)
        }
      }
    });
  }

  async onMemberAvatarUploaded(result, file) {
    const { id, modifiedAt, onCompleteRefresh, intl } = this.props;
    await client.member.update(id, {
      avatarId: result.id,
    }, modifiedAt);
    UIFramework.Message.success(intl.formatMessage({id: 'studio_web_member_detail_modal_avtar_upload_success'}));
    onCompleteRefresh();
  }

  onMemberAvatarUploadFail(err) {
    const { intl } = this.props;
    console.error(err);
    UIFramework.Modal.error({
      title: intl.formatMessage({id: 'studio_web_member_detail_modal_avtar_upload_fail'}),
      content: err.stack,
    });
  }

  async createCheckIn() {
    const { intl } = this.props;
    let checkIn ;
    try {
      checkIn = await client.checkIn.create({
        memberId: this.props.id,
      });
      let checkIns = this.state.checkIns
      checkIns.push(checkIn)
      this.setState({
        checkIns: checkIns,
      });
      mixpanel.track( "会员详情：进店登记" );
    } catch (error) {
      console.error(error)
      UIFramework.Message.error(intl.formatMessage({id: 'studio_web_member_detail_modal_checkin_attempt_fail'}));
    }
  }

  hideModal() {
    this.setState({
      modalVisibled: false,
    });
  }

  async onComplete() {
    location.href='/member'
    this.hideModal();
  }

  render() {
    const {checkIns} = this.state
    const { intl } = this.props;
    return (
      <MasterDetail.Card actions={this.actions}>
        <h3><FormattedMessage id="studio_web_member_detail_title"/></h3>
        <span key='checkIn' className={'status-tag'.concat(checkIns.length>0?' green-bg':'')}>
          {
            checkIns.length > 0 ?
            intl.formatMessage({id: 'studio_web_member_detail_checkin_status_today'}) :
            intl.formatMessage({id: 'studio_web_member_detail_checkin_status_not_today'})
          }
        </span>
        <UIFramework>
          <UIFramework.Row>
            <UIFramework.Upload
              token={this.state.uptoken}
              onSuccess={this.onMemberAvatarUploaded.bind(this)}
              onError={this.onMemberAvatarUploadFail.bind(this)}>
              <UIFramework.Image size={120} src={this.props.avatar} style={{marginRight: '10px'}} />
              <UIFramework.Cell>
                <UIFramework.Button onClick={() => {mixpanel.track( "会员详情：上传会员头像" )}}>
                  <FormattedMessage id="studio_web_member_detail_btn_upload_avtar"/>
                </UIFramework.Button>
                <UIFramework.Divider />
                <UIFramework.Text text={intl.formatMessage({id: 'studio_web_member_detail_upload_avtar_note'})} />
              </UIFramework.Cell>
            </UIFramework.Upload>
          </UIFramework.Row>
        </UIFramework>
        <MasterDetail.Card.InlineRow name={intl.formatMessage({id: 'studio_web_member_detail_field_name'})}>
          <span>{this.props.nickname}</span>
        </MasterDetail.Card.InlineRow>
        <MasterDetail.Card.InlineRow name={intl.formatMessage({id: 'studio_web_member_detail_field_phone'})}>
          <span>{this.props.phone}</span>
        </MasterDetail.Card.InlineRow>
        <MasterDetail.Card.InlineRow name={intl.formatMessage({id: 'studio_web_member_detail_field_email'})}>
        { this.props.email.endsWith('theweflex.com') ?
          <span>{intl.formatMessage({id: 'studio_web_member_detail_field_email_default'})}</span> :
          <a href={'mailto:' + this.props.email}>{this.props.email}</a>
        }
        </MasterDetail.Card.InlineRow>
        <MasterDetail.Card.InlineRow name={intl.formatMessage({id: 'studio_web_member_detail_field_source'})}>
          <span>{this.props.source || intl.formatMessage({id: 'studio_web_member_detail_field_source_default'})}</span>
        </MasterDetail.Card.InlineRow>
        <MasterDetail.Card.InlineRow name={intl.formatMessage({id: 'studio_web_member_detail_field_remarks'})}>
          <span>{this.props.comment || intl.formatMessage({id: 'studio_web_member_detail_field_remarks_default'})}</span>
        </MasterDetail.Card.InlineRow>
        <UIFramework.Modal
          title={intl.formatMessage({id: 'studio_web_member_detail_modal_edit_membership'})}
          visible={this.state.modalVisibled}
          onCancel={this.hideModal.bind(this)}
          footer="">
          <ViewToAddMember
            onComplete={this.onComplete.bind(this)}
            memberId={this.props.id}
            type="edit"
          />
        </UIFramework.Modal>
      </MasterDetail.Card>
    );
  }
}

const UserProfileCard = injectIntl(UserProfileCardInjected);

class MembershipCardInjected extends React.Component {
  static propTypes = {
    /**
     * @property {Number} width - the width of membership card.
     */
    width: React.PropTypes.number,
    /**
     * @property {Object} data - the data
     */
    data: React.PropTypes.object,
    /**
     * @property {Function} onComplete - callback to execute on complete
     */
    onComplete: React.PropTypes.func,
    /**
     * @property {Object} member - the member data
     */
    member: React.PropTypes.object,
    /**
     * @property {Object} intl - react internationalization
     */
    intl: intlShape.isRequired,
  };

  /**
   * @constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  /**
   * view the modal to change the information of this card
   * @method viewModal
   */
  viewModal() {
    if(!this.props.data){
      mixpanel.track( "会员详情：添加会卡");
    }
    this.setState({
      visible: true,
    });
  }

  /**
   * hide the modal changing the information of this card
   * @method hideModal
   */
  hideModal() {
    this.setState({
      visible: false,
    });
  }

  /**
   * fired when modal completed
   * @method onComplete
   * @async
   */
  async onComplete() {
    this.props.onComplete();
    this.hideModal();
  }

  /**
   * @method render - render function
   */
  render() {
    const { intl } = this.props;
    return (
      <span style={{display: 'inline-block', marginBottom: '10px'}}>
        <UIMembershipCard
          type="membership"
          onClick={this.viewModal.bind(this)}
          width={this.props.width}
          data={this.props.data}/>
        <UIFramework.Modal
          title={intl.formatMessage({id: 'studio_web_member_detail_membership_card_title'})}
          visible={this.state.visible}
          onCancel={() => this.setState({visible: false})}
          footer="">
          <ViewToAddMembership
            {...this.props}
            onComplete={this.onComplete.bind(this)}/>
        </UIFramework.Modal>
      </span>
    );
  }
};

const MembershipCard = injectIntl(MembershipCardInjected);

class MembershipList extends React.Component {
  static propTypes = {
    /**
     * @property {Object} member - the member data
     */
    member: React.PropTypes.object,
    /**
     * @property {Detail} context - the context
     */
    context: React.PropTypes.object,

    onComplete: React.PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      member: props.member,
    };
  }

  componentDidMount() {
    this.refresh(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.refresh(nextProps);
  }

  async refresh(props) {
    let member = await client.member.get(
      props.member.id,
      {
        include: [
          {
            relation: 'memberships',
            scope: {
              where: {
                trashedAt: {
                  exists: false
                }
              },
              include: [
                'payments',
                'package',
                'venue',
              ]
            }
          }
        ]
      }
    );

    member.memberships = member.memberships.map( (item)=>{
      return Object.assign(item.package, item);
    } );

    this.setState({member});
  }

  cards() {
    if (this.refs.membershipcards === undefined) {
      return;
    }
    const container = this.refs.membershipcards;
    const width = parseInt(container.getBoundingClientRect().width) * 0.30;

    return this.state.member.memberships.map((membership, key) => {
      if (!membership.package) {
        return;
      }
      const data = Object.assign(membership, {
        'package': Object.assign({}, membership.package, {
          price: membership.price || membership.package.price,
          createdAt: membership.createdAt,
          startsAt: membership.startsAt,
          expiresAt: membership.expiresAt,
        })
      });
      return <MembershipCard
        key={key}
        width={width}
        data={data}
        onComplete={this.props.onComplete}
        member={this.state.member}
      />;
    }).concat(
      <MembershipCard
        key="add"
        width={width}
        onComplete={this.props.onComplete}
        member={this.state.member}
      />
    );
  }

  render() {
    return (
      <MasterDetail.Card>
        <h3><FormattedMessage id="studio_web_member_detail_membership_list_title"/></h3>
        <div className="membership-cards" ref="membershipcards">
          {this.cards()}
        </div>
      </MasterDetail.Card>
    );
  }
}

function toHighLightText (text) {
  return <span className='high-light'>{text}</span>;
}

class MemberOperation extends React.Component {
  constructor(props) {
    super(props);

    const { userId, memberId, venueId } = this.props;

    this.state = {
      operation: [],
    };

    this.cache = {
      colors : {
        classReserve     : "#80c7e8",
        classCancel      : "#ff8ac2",
        ptSessionReserve : "#80c7e8",
        ptSessionCancel  : "#ff8ac2",
        membershipCreate : "#6ed4a4",
        membershipDelete : "#ff8ac2",
        membershipUpdate : "#f0ab51",
      },
    };

    this.updateOperationList();
  }

  componentWillReceiveProps(nextProps) {
    this.updateOperationList(nextProps);
  }

  async updateOperationList(props) {
    const { memberId, userId, venueId } = props || this.props;

    const operationList = ( await client.operation.list({
      where :{
        memberId,
        or: [
          {record: { like: '编辑了会卡'} },
          //{record: { like: '删除了会卡'} },
          {record: { like: '购买了会卡'} },
        ]
      }
    }) ).map(item => {
      let operationItem = {
        createdAt : item.createdAt,
      };
      const operationType = {
        '删除了会卡': 'membershipDelete',
        '编辑了会卡': 'membershipUpdate',
        '购买了会卡': 'membershipCreate',
      };
      for(let key in operationType) {
        if(item.record.indexOf(key) > 0) {
          let arr = item.record.split('<br/>');
          let index1 = (arr[0].indexOf('：') > 0) ? arr[0].indexOf('：'): arr[0].indexOf(':');
          let text = [<p>{ arr[0].slice(0, index1 + 1) } { toHighLightText( arr[0].slice(index1 + 1) ) }</p>];
          for(let i = 1; i < arr.length; i++){
            text.push(<p>{arr[i]}</p>);
          };
          operationItem.text =<span>{text}</span>;
          operationItem.status = operationType[key];
          break;
        }
      }
      return operationItem;
    });

    const orderList = ( await client.order.list({
      where   : {
        userId,
        venueId,
        createdAt: {
          gt: this.props.memberCreatedAt,
        }
      },
      include : [
        {
          "class" : "template"
        },
        {
          "payments": {"membership": "package"}
        },
      ],
    }) ).map( this.toOrderItems );

    const ptSessionList = ( await client.ptSession.list({
      where   : { memberId },
      include : [
        "trainer",
        {
          "payment": {"membership": "package"}
        },
      ],
    }) ).map( this.toPTSessionItems );

    const membershipList = ( await client.member.get( memberId, {
      include : {"memberships": "package"},
    }) )["memberships"].map( this.toMembershipItems );

    let operation = flattenDeep([orderList, ptSessionList, membershipList, operationList]);
    operation.sort((previousItem, nextItem)=>{ return compareDesc(previousItem.createdAt, nextItem.createdAt)});
    this.setState({operation});
  }

  toOrderItems (orderItem) {
    const className  = orderItem.class.template.name;
    const membershipName = orderItem.payments[0].membership.package.name;

    let orderItems = [{
      status     : "classReserve",
      createdAt  : orderItem.createdAt,
      text       : <span>用户使用 { toHighLightText(membershipName) } 预定了课程 { toHighLightText(className) }<p>上课时间：{format(orderItem.class.startsAt, 'YYYY-MM-DD HH:mm')}</p></span>,
    }];

    if (orderItem.cancelledAt) {
      orderItems.push({
        status    : "classCancel",
        createdAt : orderItem.cancelledAt,
        text      : <span>用户取消了课程： { toHighLightText(className) } 所属会卡： { toHighLightText(membershipName) }<p>上课时间：{format(orderItem.class.startsAt, 'YYYY-MM-DD HH:mm')}</p></span>,
      });
    };

    return orderItems;
  }

  toPTSessionItems (ptSessionItem) {
    const trainerName  = ptSessionItem.trainer.fullname.first + ptSessionItem.trainer.fullname.last;
    const membershipName = ptSessionItem.payment.membership.package.name;

    let ptSessionItems = [{
      status     : "ptSessionReserve",
      createdAt  : ptSessionItem.createdAt,
      text : <span>用户使用 { toHighLightText(membershipName) } 预定了 { toHighLightText(trainerName) } 的私教课程<p>上课时间：{format(ptSessionItem.startsAt, 'YYYY-MM-DD HH:mm')}</p></span>,
    }];

    if (ptSessionItem.cancelledAt) {
      ptSessionItems.push({
        status : "ptSessionCancel",
        createdAt : ptSessionItem.cancelledAt,
        text : <span>用户取消了 { toHighLightText(trainerName) } 的私教课程 所属会卡：{ toHighLightText(membershipName) }<p>上课时间：{format(ptSessionItem.startsAt, 'YYYY-MM-DD HH:mm')}</p></span>,
      });
    };

    return ptSessionItems;
  }

  toMembershipItems (membershipItem) {
    const membershipName = membershipItem.package.name;

    // let membershipItems = [{
    //   status     : "membershipCreate",
    //   createdAt  : membershipItem.createdAt,
    //   text       : <span>用户购买了会卡：{ toHighLightText(membershipName) }</span>,
    // }];
    let membershipItems = [];
    if (membershipItem.trashedAt) {
      membershipItems.push({
        status     : "membershipDelete",
        createdAt  : membershipItem.trashedAt,
        text       : <span>管理员删除了会卡：{ toHighLightText(membershipName) }</span>,
      });
    };

    return membershipItems;
  }

  render () {
    return (
      <div className="member-operation">
        <h3><FormattedMessage id='studio_web_member_detail_operation_record_title'/></h3>
        <div className="member-operation-list">
          <UIHistory
            colors={ this.cache.colors }
            data={ this.state.operation }
            description={ (item)=>{ return item.text } }
          />
        </div>
      </div>
    );
  }
}

class Detail extends React.Component {
  constructor(props) {
    super(props);

    this.updateDetailView = this.updateDetailView.bind(this);
  }

  updateDetailView() {
    this.setState({});
  }

  render() {
    const member = this.props.data;
    return (
      <div className="membership-detail-container">
        <MasterDetail.Cards position="left">
          <UserProfileCard context={this} {...member} onCompleteRefresh={this.props.onRefresh} onComplete={this.updateDetailView}/>
          <MembershipList context={this} member={member} onComplete={this.updateDetailView} />
        </MasterDetail.Cards>
        <MasterDetail.Cards position="right">
          <MemberOperation memberId={member.id} memberCreatedAt={member.createdAt} userId={member.userId} venueId={member.venueId} />
        </MasterDetail.Cards>
      </div>
    );
  }

}
export default Detail;
