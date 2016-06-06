"use strict";

import React from 'react';
import moment from 'moment';
import UIFramework from 'weflex-ui';
import { client } from '../../api';
import { UIHistory } from '../../components/ui-history';
import UIMembershipCard from '../../components/ui-membership-card';
import { getFormatTime } from '../calendar/util.js';
import './detail.css';

class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      membership: null
    };
  }
  async componentWillMount() {
    const order = this.props.data;
    const payment = order.payments && order.payments[0];
    if (payment && payment.membership && payment.membership.id) {
      const membership = await client.membership.get(payment.membership.id, {
        include: ['package']
      });
      const reducedMemberships = await client.middleware('/transaction/reduce-memberships', {
        userId: order.userId,
        venueId: order.class.template.venueId
      });
      const reducedMembership = _.find(reducedMemberships, (reduced) => {
        return reduced.membershipId === membership.id
      });
      this.setState({
        membership: Object.assign(
          membership,
          reducedMembership,
          {
            lifetime: membership.package.lifetime,
            category: membership.package.category,
            passes: membership.package.passes,
            color: membership.package.color,
          }
        )
      });
    }
  }
  get detailActions() {
    let list = [];
    if (this.props.data.id) {
      list.push({
        title: '删除订单',
        onClick: this.onDelete.bind(this),
        disableToggled: true,
      });
    }
    return list;
  }
  async onDelete() {
    let self = this;
    UIFramework.Modal.confirm({
      title: '确认删除该订单?',
      content: '确认删除该订单?',
      onOk: async () => {
        await client.order.delete(self.props.data.id, self.props.data.modifiedAt);
        await self.props.updateMaster();
      }
    });
  }
  payment(payments) {
    let description = '未知方式支付';
    let preview = null;
    let metadata = null;
    const data = payments && payments[0];
    if (this.state.membership) {
      const membership = this.state.membership;

      description = `使用 ${membership.name} 抵扣 ${payments[0].fee} 元`;
      preview = <UIMembershipCard data={membership} type="membership"/>;
      metadata = (
        <div className="order-payment-metadata-container">
          <fieldset>
            <legend>会卡详情</legend>
          </fieldset>
          <div className="detail-card-row">
            <label>会卡种类</label>
            <span>{membership.category === 'group' ? '团课' : '私教'}</span>
          </div>
          <div className="detail-card-row">
            <label>会卡类型</label>
            <span>{membership.accessType === 'unlimited' ? '不限次卡': '多次卡'}</span>
          </div>
          {
            'available' in membership ?
            <div className="detail-card-row">
              <label>剩余次数</label>
              <span>{membership.available}次</span>
            </div> : null
          }
          <div className="detail-card-row">
            <label>开卡时间</label>
            <span>{moment(membership.createdAt).format('YYYY[年]MM[月]DD[日]')}</span>
          </div>
          {
            'expiredAt' in membership ?
            <div className="detail-card-row">
              <label>到期时间</label>
              <span>
                {moment(membership.expiredAt).format('YYYY[年]MM[月]DD[日]')}
              </span>
            </div> : null
          }
        </div>
      );
    } else if (data && data._raw) {
      if (data._raw.method === 'wechat') {
        description = `使用微信支付：${data.fee} ${data._raw.currency}`;
      } else {
        description = `使用支付宝支付：${data.fee} ${data._raw.currency}`;
      }
    }
    return (
      <div className="detail-card order-payment">
        <h3>费用支付</h3>
        <div className="order-payment-description">{description}</div>
        <div className="order-payment-preview">{preview}</div>
        <div className="order-payment-metadata">{metadata}</div>
      </div>
    );
  }
  history(logs) {
    return (
      <div className="detail-card detail-card-right">
        <h3>订单历史记录</h3>
        <UIHistory 
          data={logs}
          colors={{
            paid: '#80c7e8',
            cancel: '#ff8ac2',
            checkin: '#6ed4a4',
          }}
          description={(item) => {
            switch (item.status) {
              case 'paid'   : return '用户预定了课程'; break;
              case 'cancel' : return '用户取消了预定'; break;
              case 'checkin': return '用户签到了课程'; break;
            }
          }}
        />
      </div>
    );
  }
  render() {
    const order = this.props.data;
    const { date, from, to, trainer } = order.class;
    return (
      <div className="detail-cards order-detail-container">
        <div className="detail-cards-left">
          <div className="detail-card" style={{height: '100%'}}>
            <h3>订单主要信息</h3>
            <div className="order-user">
              <UIFramework.Image size={80} src={order.user.avatar} />
              <div className="detail-card-row">
                <label>用户</label>
                <span>{order.user.nickname}</span>
              </div>
              <div className="detail-card-row">
                <label>手机号码</label>
                <span>{order.user.phone}</span>
              </div>
              <div className="detail-card-row">
                <label>电子邮箱</label>
                <a href={'mailto:' + order.user.email}>{order.user.email}</a>
              </div>
            </div>
            <div className="order-class">
              <div className="detail-card-row">
                <label>报名课程</label>
                <span>{order.class.template.name}</span>
              </div>
              <div className="detail-card-row">
                <label>课程教练</label>
                <span>{trainer.fullname.first} {trainer.fullname.last}</span>
              </div>
              <div className="detail-card-row">
                <label>课程日期</label>
                <span>{moment(date).format('MM[月]DD[日]')}</span>
              </div>
              <div className="detail-card-row">
                <label>课程时间</label>
                <span>{getFormatTime(from)} - {getFormatTime(to)}</span>
              </div>
              <div className="detail-card-row">
                <label>课程详情</label>
                <span>{order.class.template.description || '这个人很懒，无课程详情'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="detail-cards-right">
          {this.payment(order.payments)}
          {this.history(order.history)}
        </div>
      </div>
    );
  }
}

module.exports = Detail;
