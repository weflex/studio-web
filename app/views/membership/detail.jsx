"use strict";

import React from 'react';
import moment from 'moment';
import { ClipLoader } from 'halogen';
import { client } from '../../api';
import './detail.css';

class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
    };
  }
  async componentWillMount() {
    const orders = await client.order.list({
      where: {
        userId: this.props.data.userId,
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
  render() {
    let membership = this.props.data;
    let userAvatar = 'http://static.theweflex.com/default-avatar-male.png';
    if (membership.user.avatar) {
      userAvatar = membership.user.avatar.uri;
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
              <span>{membership.user.nickname}</span>
            </div>
            <div className="detail-card-row">
              <label>手机号码</label>
              <span>{membership.user.phone}</span>
            </div>
          </div>
          <div className="detail-card">
            <h3>订课记录</h3>
            <ul className="membership-orders">
              {this.state.orders.map((order, index) => {
                const date = moment(order.class.date).format('MM[月]DD[日]');
                const title = order.class.template.name;
                const trainer = order.class.trainer || order.class.template.trainer;
                return (
                  <li key={index}>
                    <a>{membership.user.nickname}</a>
                    {date}预定了
                    <a>{trainer.fullname.first} {trainer.fullname.last}</a>
                    老师的
                    <a>{title}</a>
                    课程
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="detail-cards-right">
          <div className="detail-card">
            <h3>会卡信息</h3>
            <div className="detail-card-row">
              <label>名称</label>
              <span>{membership.package.name}</span>
            </div>
            <div className="detail-card-row">
              <label>价格</label>
              <span>{membership.package.price}元</span>
            </div>
            <div className="detail-card-row">
              <label>类别</label>
              <span>{membership.package.category}</span>
            </div>
            <div className="detail-card-row">
              <label>过期时间</label>
              <span>{moment(membership.package.expiredAt).format('lll')}</span>
            </div>
            <div className="detail-card-row">
              <label>详情</label>
              <span>{membership.package.description}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Detail;
