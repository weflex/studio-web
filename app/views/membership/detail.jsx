"use strict";

import React from 'react';
import moment from 'moment';
import { UIMembershipCard } from '../../components/ui-membership-card';
import { UIHistory } from '../../components/ui-history';
import { DropModal } from 'boron2';
import { ClipLoader } from 'halogen';
import { client } from '../../api';
import AddMembershipView from './add';
import './detail.css';

class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      membershipProps: {},
    };
  }
  async componentWillMount() {
    const orders = await client.order.list({
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
    });
    this.setState({ orders });
  }
  addMembership() {
    this.refs.membershipModal.show();
    this.setState({
      membershipProps: {
        user: this.props.data,
      }
    });
  }
  async onCompleteMembership() {
    this.refs.membershipModal.hide();
    await this.props.updateMaster();
  }
  cards() {
    if (this.refs.membershipcards === undefined) {
      return;
    }
    const container = this.refs.membershipcards;
    const width = parseInt(container.getBoundingClientRect().width) * 0.30;
    return this.props.data.memberships.map((membership, key) => {
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
        onClick={this.addMembership.bind(this)}
        width={width}
      />
    );
  }
  render() {
    let user = this.props.data;
    let userAvatar = 'http://static.theweflex.com/default-avatar-male.png';
    if (user.avatar) {
      userAvatar = user.avatar.uri;
    }
    return (
      <div className="membership-detail-container">
        <div className="detail-cards-left">
          <div className="detail-card">
            <h3>基础信息</h3>
            <div className="membership-user-avatar">
              <img src={userAvatar} />
            </div>
            <div className="detail-card-row">
              <label>姓名</label>
              <span>{user.nickname}</span>
            </div>
            <div className="detail-card-row">
              <label>手机号码</label>
              <span>{user.phone}</span>
            </div>
            <div className="detail-card-row">
              <label>电子邮箱</label>
              <a href={'mailto:' + user.email}>{user.email}</a>
            </div>
          </div>
          <div className="detail-card">
            <h3>他的会卡</h3>
            <div className="membership-cards" ref="membershipcards">
              {this.cards()}
            </div>
            <DropModal ref="membershipModal">
              <AddMembershipView
                onComplete={this.onCompleteMembership.bind(this)}
                {...this.state.membershipProps}
              />
            </DropModal>
          </div>
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
