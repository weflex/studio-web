"use strict";

import _ from 'lodash';
import React from 'react';
import moment from 'moment';
import UIFramework from 'weflex-ui';
import UIMembershipCard from '../../components/ui-membership-card';
import { UIHistory } from '../../components/ui-history';
import { client } from '../../api';
import AddMembershipView from './add';
import './detail.css';

class UserProfileCard extends React.Component {
  static propTypes = {
    avatar: React.PropTypes.object,
    nickname: React.PropTypes.string,
    phone: React.PropTypes.string,
    email: React.PropTypes.string,
  };
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="detail-card">
        <h3>基础信息</h3>
        <div className="membership-user-avatar">
          <UIFramework.Image 
            src={this.props.avatar} 
            style={{}} 
            size={60} 
          />
        </div>
        <div className="detail-card-row">
          <label>姓名</label>
          <span>{this.props.nickname}</span>
        </div>
        <div className="detail-card-row">
          <label>手机号码</label>
          <span>{this.props.phone}</span>
        </div>
        <div className="detail-card-row">
          <label>电子邮箱</label>
          <a href={'mailto:' + this.props.email}>{this.props.email}</a>
        </div>
      </div>
    );
  }
}

class MembershipsCard extends React.Component {
  static propTypes = {
    list: React.PropTypes.array,
    user: React.PropTypes.object,
    context: React.PropTypes.object,
  };
  constructor(props) {
    super(props);
    this.state = {
      modalVisibled: false,
      membershipProps: {},
    };
  }
  viewModal() {
    this.setState({
      modalVisibled: true,
      membershipProps: {
        user: this.props.user,
      }
    });
  }
  hideModal() {
    this.setState({
      modalVisibled: false,
    });
  }
  async onComplete() {
    this.hideModal();
    await this.props.context.props.updateMaster();
  }
  cards() {
    if (this.refs.membershipcards === undefined) {
      return;
    }
    const container = this.refs.membershipcards;
    const width = parseInt(container.getBoundingClientRect().width) * 0.30;
    return this.props.list.map((membership, key) => {
      return (
        <UIMembershipCard 
          key={key} 
          width={width}
          data={membership.package}
        />
      );
    }).concat(
      <UIMembershipCard
        key="add"
        onClick={this.viewModal.bind(this)}
        width={width}
      />
    );
  }
  render() {
    return (
      <div className="detail-card">
        <h3>他的会卡</h3>
        <div className="membership-cards" ref="membershipcards">
          {this.cards()}
        </div>
        <UIFramework.Modal visible={this.state.modalVisibled}
          onCancel={this.hideModal.bind(this)}
          footer="">
          <AddMembershipView
            onComplete={this.onComplete.bind(this)}
            {...this.state.membershipProps}
          />
        </UIFramework.Modal>
      </div>
    );
  }
}

class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      memberships: [],
    };
  }
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
    const memberships = (await client.membership.list({
      where: {
        id: {
          inq: _.map(this.props.data.memberships, 'id'),
        }
      },
      include: [
        'package',
        {'payments': ['order']}
      ],
    })).map((membership) => {
      if (membership.package.accessType === 'multiple') {
        const used = membership.payments.filter((p) => p.order).length;
        membership.package.passes -= used;
        if (membership.package.passes < 0) {
          membership.package.passes = 0;
        }
      }
      return membership;
    });
    this.setState({ orders, memberships });
  }
  render() {
    let user = this.props.data;
    return (
      <div className="membership-detail-container">
        <div className="detail-cards-left">
          <UserProfileCard {...user} />
          <MembershipsCard context={this} list={this.state.memberships} user={user} />
        </div>
        <div className="detail-cards-right">
          <div className="detail-card">
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
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Detail;
