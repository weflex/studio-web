"use strict";

import React from 'react';
import moment from 'moment';
import { client } from '../../api';
import './detail.css';

class Detail extends React.Component {
  render() {
    const order = this.props.data;
    const { date, from, to, trainer } = order.class;
    return (
      <div className="order-detail-container">
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
          <div className="detail-card order-payment">
            <h3>费用支付</h3>
            <div className="order-payment-description">使用[会员卡]抵扣</div>
            <div className="order-payment-preview order-class-package">
            </div>
            <fieldset>
              <legend>会卡详情</legend>
            </fieldset>
            <div className="detail-card-row">
              <label>会卡类型</label>
              <span>次卡</span>
            </div>
            <div className="detail-card-row">
              <label>剩余次数</label>
              <span>3次</span>
            </div>
            <div className="detail-card-row">
              <label>到期时间</label>
              <span>{moment().format('lll')}</span>
            </div>
          </div>
          <div className="detail-card detail-card-right order-history">
            <h3>订单最近操作</h3>
            <div className="order-history-timeline">
              <p>无历史记录</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Detail;
