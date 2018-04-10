import './index.css';
import { flattenDeep } from 'lodash';
import React from 'react';
import UIFramework from '@weflex/weflex-ui';
import MasterDetail from '../../components/master-detail';
import UIMembershipCard from '../../components/ui-membership-card';
import { UIHistory } from '../../components/ui-history';
import ViewToAddMember from './add-member';
import ViewToAddMembership from './add-membership';
import { client } from '../../api';

import { format, compareDesc } from 'date-fns';
import { keyBy } from 'lodash';

class UserProfileCard extends React.Component {
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
    let actions = [];
    actions.push(
      <a key="edit" onClick={this.onEdit.bind(this)}>编辑会员</a>,
      <a key="dele" onClick={this.onDelete.bind(this)}>删除</a>
    )
    if (this.props.checkIns.length == 0) {
      actions.unshift(<a key="chenkIns" onClick={this.createCheckIn.bind(this)}>进店登记</a>)
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
    const { id, modifiedAt, nickname, onCompleteRefresh } = this.props;
    UIFramework.Modal.confirm({
      title: '你确认要删除会员：' + nickname,
      content: '删除会员资料将不可恢复！',
      onOk: async () => {
        if (id) {
          await client.member.delete(id, modifiedAt);
          //await props.context.props.updateMaster();
          UIFramework.Message.success('已删除会员：' + nickname);
          onCompleteRefresh();
        } else {
          // TODO(Yorkie)
        }
      }
    });
  }

  async onMemberAvatarUploaded(result, file) {
    const { id, modifiedAt, onCompleteRefresh } = this.props;
    await client.member.update(id, {
      avatarId: result.id,
    }, modifiedAt);
    UIFramework.Message.success('上传头像成功');
    onCompleteRefresh();
  }

  onMemberAvatarUploadFail(err) {
    console.error(err);
    UIFramework.Modal.error({
      title: '软件遇到了一个致命错误',
      content: err.stack,
    });
  }

  async createCheckIn() {
    let checkIn ;
    try {
      checkIn = await client.checkIn.create({
        memberId: this.props.id,
      });
      this.props.onCompleteRefresh();
      mixpanel.track( "会员详情：进店登记" );
    } catch (error) {
      console.error(error)
      UIFramework.Message.error('登记失败')
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
    const {checkIns} = this.props
    return (
      <MasterDetail.Card actions={this.actions}>
        <h3>基础信息</h3>
        <span key='checkIn' className={'status-tag'.concat(checkIns.length>0?' green-bg':'')}>{checkIns.length>0?'今日已登记':'今日未登记'}</span>
        <UIFramework>
          <UIFramework.Row>
            <UIFramework.Upload
              token={this.state.uptoken}
              onSuccess={this.onMemberAvatarUploaded.bind(this)}
              onError={this.onMemberAvatarUploadFail.bind(this)}>
              <UIFramework.Image size={120} src={this.props.avatar} style={{marginRight: '10px'}} />
              <UIFramework.Cell>
                <UIFramework.Button onClick={() => {mixpanel.track( "会员详情：上传会员头像" )}}>修改会员头像</UIFramework.Button>
                <UIFramework.Divider />
                <UIFramework.Text text="修改会员头像并不会影响到用户的信息" />
              </UIFramework.Cell>
            </UIFramework.Upload>
          </UIFramework.Row>
        </UIFramework>
        <MasterDetail.Card.InlineRow name="姓名">
          <span>{this.props.nickname}</span>
        </MasterDetail.Card.InlineRow>
        <MasterDetail.Card.InlineRow name="手机号码">
          <span>{this.props.phone}</span>
        </MasterDetail.Card.InlineRow>
        <MasterDetail.Card.InlineRow name="电子邮箱">
        {this.props.email.endsWith('theweflex.com') ? <span>未设置</span> : <a href={'mailto:' + this.props.email}>{this.props.email}</a>}
        </MasterDetail.Card.InlineRow>
        <MasterDetail.Card.InlineRow name="来源">
          <span>{this.props.source || '未知'}</span>
        </MasterDetail.Card.InlineRow>
        <MasterDetail.Card.InlineRow name="备注">
          <span>{this.props.comment || '无备注'}</span>
        </MasterDetail.Card.InlineRow>
        <UIFramework.Modal
          title="编辑会员信息"
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

class MembershipCard extends React.Component {
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
    return (
      <span style={{display: 'inline-block', marginBottom: '10px'}}>
        <UIMembershipCard
          type="membership"
          onClick={this.viewModal.bind(this)}
          width={this.props.width}
          data={this.props.data}
        />
        <UIFramework.Modal
          title="会卡"
          visible={this.state.visible}
          onCancel={() => this.setState({visible: false})}
          footer="">
          <ViewToAddMembership
            {...this.props}
            onComplete={this.onComplete.bind(this)}
          />
        </UIFramework.Modal>
      </span>
    );
  }
}

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
        member={this.state.member} />;
    }).concat(
      <MembershipCard
        key="add"
        width={width}
        onComplete={this.props.onComplete}
        member={this.state.member}/>
    );
  }

  render() {
    return (
      <MasterDetail.Card>
        <h3>他的会卡</h3>
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
        checkIn          : "#4fd898"
      },
    };

    this.updateOperationList();
  }

  componentWillReceiveProps(nextProps) {
    this.updateOperationList(nextProps);
  }

  async updateOperationList(props) {
    const { memberId, userId, venueId } = props || this.props;
    const checkIn = (await client.operation.list({
      where: {
        memberId,
        record: { like: '进店签到' }
      }
    })).map(item =>{
      let  checkIn= {
        createdAt: item.createdAt,
        status: "checkIn",
        text:<p>用户完成进店登记</p>
      };
      return checkIn
    })
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

    let operation = flattenDeep([orderList, ptSessionList, membershipList, operationList,checkIn]);
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
        <h3>操作记录</h3>
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

export default class Detail extends React.Component {
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
