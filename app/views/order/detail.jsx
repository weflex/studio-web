"use strict";

import React from 'react';
import moment from 'moment';
import { client } from '../../api';
import MembershipCard from '../../components/membership-card';
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
    if (payment.membership && payment.membership.id) {
      const membership = await client.membership.get(payment.membership.id, {
        include: ['package']
      });
      this.setState({
        membership,
      });
    }
  }
  payment(payments) {
    let description = '未知方式支付';
    let preview = null;
    let metadata = null;
    const data = payments && payments[0];
    if (this.state.membership) {
      const membership = this.state.membership;
      const classPackage = membership.package;
      const lifetime = classPackage.lifetime;
      description = `使用${classPackage.name}抵扣`;
      preview = (
        <MembershipCard 
          data={classPackage}
        />
      );
      metadata = (
        <div className="order-payment-metadata-container">
          <fieldset>
            <legend>会卡详情</legend>
          </fieldset>
          <div className="detail-card-row">
            <label>会卡种类</label>
            <span>{classPackage.category === 'group' ? '团课' : '私教'}</span>
          </div>
          <div className="detail-card-row">
            <label>会卡类型</label>
            <span>{classPackage.accessType === 'unlimited' ? '不限次卡': '多次卡'}</span>
          </div>
          <div className="detail-card-row">
            <label>剩余次数</label>
            <span>{classPackage.passes}次</span>
          </div>
          <div className="detail-card-row">
            <label>开卡时间</label>
            <span>{moment(membership.createdAt).format('YYYY[年]MM[月]DD[日]')}</span>
          </div>
          <div className="detail-card-row">
            <label>到期时间</label>
            <span>
              {moment(membership.createdAt)
                .add(lifetime.value, lifetime.scale)
                .format('YYYY[年]MM[月]DD[日]')}
            </span>
          </div>
        </div>
      );
    } else if (data._raw) {
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
    let content;
    if (!logs.length) {
      content = <div className="order-history-empty">无最近记录</div>;
    } else {
      content = (
        <ul className="order-logs">
          {logs.map((log, key) => {
            const date = moment(log.createdAt);
            const className = 'order-log order-log-' + log.status;
            let description;
            if (log.status === 'cancel') {
              description = '用户取消了预定';
            } else if (log.status === 'paid') {
              description = '用户预定了课程';
            } else if (log.status === 'checkin') {
              description = '用户签到了课程';
            } else {
              description = '未知操作';
            }
            return (
              <li key={key} className={className}>
                <span className="order-log-dot"></span>
                <span className="order-log-date">
                  {date.format('MM[月]DD[日]')}
                </span>
                <span className="order-log-time">
                  {date.format('hh:mm')}
                </span>
                <span className="order-log-description">
                  {description}
                </span>
              </li>
            );
          })}
        </ul>
      );
      return (
        <div className="detail-card detail-card-right order-history">
          <h3>订单最近操作</h3>
          {content}
        </div>
      );
    }
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
              <div className="order-user-avatar">
                <img src={order.user.avatar.uri} />
              </div>
              <div className="detail-card-row">
                <label>用户</label>
                <span>{order.user.nickname}</span>
              </div>
              <div className="detail-card-row">
                <label>手机号码</label>
                <span>{order.user.phone}</span>
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
                <span>{moment(date).format('M[月]DD[日]')}</span>
              </div>
              <div className="detail-card-row">
                <label>课程时间</label>
                <span>{from.hour}:{from.minute} - {to.hour}:{to.minute}</span>
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
