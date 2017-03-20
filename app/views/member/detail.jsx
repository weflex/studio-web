"use strict";
/*
 * @module views.member
 */

import _ from 'lodash';
import React from 'react';
import UIFramework from 'weflex-ui';
import MasterDetail from '../../components/master-detail';
import UIMembershipCard from '../../components/ui-membership-card';
import { UIHistory } from '../../components/ui-history';
import ViewToAddMember from './add-member';
import ViewToAddMembership from './add-membership';
import { client } from '../../api';
import './detail.css';

/**
 * @class UserProfileCard
 */
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
    return [
      <a key="edit" onClick={this.viewModal.bind(this)}>编辑会员</a>
    ];
  }

  /**
   * delete this card information
   * @method onDelete
   */
  onDelete() {
    const props = this.props;
    UIFramework.Modal.confirm({
      title: '你确认要删除会员：' + props.nickname,
      content: '删除会员资料将不可恢复！',
      onOk: async () => {
        if (props.id) {
          await client.member.delete(props.id, props.modifiedAt);
          await props.context.props.updateMaster();
          UIFramework.Message.success('已删除会员：' + props.nickname);
        } else {
          // TODO(Yorkie)
        }
      }
    });
  }

  /**
   * @method onMemberAvatarUploaded
   */
  async onMemberAvatarUploaded(result, file) {
    await client.member.update(this.props.id, {
      avatarId: result.id,
    }, this.props.modifiedAt);
    UIFramework.Message.success('上传头像成功');
    await this.props.context.props.updateMaster();
  }

  /**
   * @method onMemberAvatarFail
   */
  onMemberAvatarUploadFail(err) {
    console.error(err);
    UIFramework.Modal.error({
      title: '软件遇到了一个致命错误',
      content: err.stack,
    });
  }

  /**
   * view the modal to change the information of this card
   * @method viewModal
   */
  viewModal() {
    this.setState({
      modalVisibled: true,
    });
  }

  /**
   * hide the modal changing the information of this card
   * @method hideModal
   */
  hideModal() {
    this.setState({
      modalVisibled: false,
    });
  }

  /**
   * fired when modal completed
   * @method onComplete
   * @async
   */
  async onComplete() {
    this.hideModal();
  }

  /**
   * @method render
   */
  render() {
    return (
      <MasterDetail.Card actions={this.actions}>
        <h3>基础信息</h3>
        <UIFramework>
          <UIFramework.Row>
            <UIFramework.Upload 
              token={this.state.uptoken} 
              onSuccess={this.onMemberAvatarUploaded.bind(this)}
              onError={this.onMemberAvatarUploadFail.bind(this)}>
              <UIFramework.Image size={120} src={this.props.avatar} style={{marginRight: '10px'}} />
              <UIFramework.Cell>
                <UIFramework.Button>修改会员头像</UIFramework.Button>
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
            member={this.props}
          />
        </UIFramework.Modal>
      </MasterDetail.Card>
    );
  }
}

/**
 * @class MembershipCard
 * @extends React.Component
 */
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
          data={this.props.data && this.props.data.package}
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

/**
 * @class MembershipsCard
 * @extends React.Component
 */
class MembershipsCard extends React.Component {
  static propTypes = {
    /**
     * @property {Object} member - the member data
     */
    member: React.PropTypes.object,
    /**
     * @property {Detail} context - the context
     */
    context: React.PropTypes.object,
  };

  /**
   * The `MembershipCard`'s constructor will create the following
   * states:
   *   1. modelVisibled
   *   2. membershipView
   *   3. member
   * @constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      member: props.member,
    };
  }

  /**
   * In this default delegate, we sync the member object by including
   * memberships and its payments and package
   *
   * @method componentDidMount
   * @async
   */
  async componentDidMount() {
    let self = this;
    await self.refresh();

  }

  componentWillUnmount() {
  }

  /**
   * @method refresh
   * @async
   */
  async refresh() {
    const member = await client.member.get(
      this.props.member.id,
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
              ]
            }
          }
        ]
      }
    );
    this.setState({member});
  }

  /**
   * This method renders out to the cards
   * @method cards
   */
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
          correction: membership.correction
        })
      });
      return <MembershipCard
        key={key}
        width={width}
        data={data}
        onComplete={this.refresh.bind(this)}
        member={this.state.member}
      />;
    }).concat(
      <MembershipCard
        key="add"
        width={width}
        onComplete={this.refresh.bind(this)}
        member={this.state.member}
      />
    );
  }

  /**
   * @method render
   */
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

/**
 * @class Detail
 * @extends React.Component
 */
export default class extends React.Component {
  /**
   * @constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
    };
  }

  /**
   * In this delegate, we fetched the order list
   *
   * @method componentWillMount
   * @async
   */
  async componentWillMount() {
    const orders = (await client.order.list({
      where: {
        userId: this.props.data.id,
      },
      include: {
        'class': [
          'trainer',
          {
            'template': 'trainer'
          }
        ]
      },
    })).filter((order) => {
      return order.class;
    });
    this.setState({orders});
  }

  /**
   * @method render
   */
  render() {
    let member = this.props.data;
    return (
      <div className="membership-detail-container">
        <MasterDetail.Cards position="left">
          <UserProfileCard context={this} {...member} />
          <MembershipsCard context={this} member={member} />
        </MasterDetail.Cards>
        <MasterDetail.Cards position="right">
          <MasterDetail.Card>
            <h3>订课记录</h3>
            <UIHistory className="membership-orders"
              data={this.state.orders.map((item) => {
                item.createdAt = item.class.date;
                return item;
              })}
              description={(item) => {
                const title = item.class.template.name;
                const trainer = item.class.trainer || item.class.template.trainer;
                return `预定了${title}`;
              }}
            />
          </MasterDetail.Card>
        </MasterDetail.Cards>
      </div>
    );
  }
}
