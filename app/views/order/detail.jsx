"use strict";

import React from 'react';
import moment from 'moment';
import UIFramework from 'weflex-ui';
import { client } from '../../api';
import { UIHistory } from '../../components/ui-history';
import MasterDetail from '../../components/master-detail';
import UIMembershipCard from '../../components/ui-membership-card';
import { getFormatTime } from '../calendar/util.js';
import './detail.css';
import {isBefore, isAfter, format} from 'date-fns';

class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      order: props.data,
      membership: null
    };
  }
  async componentWillMount() {
    const {order} = this.state;
    const payment = order.payments && order.payments[0];
    if (payment && payment.membership && payment.membership.id) {
      const membership = await client.membership.get(payment.membership.id, {
        include: ['package']
      });

      this.setState({
        membership: Object.assign(membership.package, membership)
      });
    }
  }
  get actions() {
    let {order} = this.state;

    if (order.cancelledAt) {
      return [];
    }

    let actions = [];
    if (!order.checkedInAt) {
      actions.push(<a key="checkin" onClick={this.onCheckIn.bind(this)}>签到</a>);
    }
    if (isBefore(new Date(), order.class.startsAt)) {
      actions.push(<a key="cancel" onClick={this.onCancel.bind(this)}>取消</a>);
    }
    return actions;
  }
  async onCheckIn () {
    let {order} = this.state;
    try {
      if (order.isPT) {
        await client.ptSession.checkInById(order.id);
      } else {
        await client.order.checkInById(order.id);
      }
      order.checkedInAt = Date();
      this.setState({order});
    } catch (error) {
      UIFramework.Message.error('签到失败');
    }
  }
  async onUncheck () {
    let {order} = this.state;
    delete order.checkedInAt;
    this.setState({order});
    await client.order.uncheckById(order.id);
  }
  async onCancel() {
    let self = this;
    UIFramework.Modal.confirm({
      title: '确认取消该订单?',
      content: '确认取消该订单?',
      onOk: async () => {
        let {order} = this.state;
        order.cancelledAt = new Date();
        this.setState({order});
        if (order.isPT) {
          await client.ptSession.cancelById(order.id);
        } else {
          await client.order.cancelById(order.id);          
        }
        // await self.props.updateMaster();
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
            'expiresAt' in membership ?
            <div className="detail-card-row">
              <label>到期时间</label>
              <span>
                {moment(membership.expiresAt).format('YYYY[年]MM[月]DD[日]')}
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
  history(order) {
    var logs = [];
    ['cancelledAt', 'checkedInAt', 'createdAt'].map((field) => {
      var status;
      if (order[field]) {
        switch (field) {
        case 'cancelledAt':
          status = 'cancel';
          break;
        case 'checkedInAt':
          status = 'checkin';
          break;
        default:
          status = 'paid';
          break;
        }
        logs.push({status: status, createdAt: order[field]});
      }        
    });
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
    const {order} = this.state;
    const { date, startsAt, endsAt, trainer } = order.class;
    const now = moment();
    let tags = [];
    if (isAfter(new Date(), endsAt)) {
      tags.push(<span key='complete' className='status-tag green-bg'>课程已完成</span>);
    }
    if (order.checkedInAt) {
      tags.push(<span key='checkIn' className='status-tag green-bg'>已签到</span>);
    } else {
      tags.push(<span key='checkIn' className='status-tag'>尚未签到</span>);
    }

    if (order.cancelledAt) {
      tags = [<span key='cancel' className='status-tag red-bg'>已取消</span>];
    }
              
    return (
      <div className="detail-cards order-detail-container">
        <div className="detail-cards-left">
          <MasterDetail.Card actions={this.actions}>
            <div className="detail-card" style={{height: '100%'}}>
              <h3>订单主要信息</h3>
              {tags}
              <div className="order-member">
                <UIFramework.Image size={80} src={order.member.avatar} />
                <div className="detail-card-row">
                  <label>用户</label>
                  <span>{order.member.nickname}</span>
                </div>
                <div className="detail-card-row">
                  <label>手机号码</label>
                  <span>{order.member.phone}</span>
                </div>
                <div className="detail-card-row">
                  <label>电子邮箱</label>
                  {order.user.email.endsWith('theweflex.com') ? <span>未设置</span> : <a href={'`mailto:' + order.user.email}>{order.user.email}</a>}
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
                  <span>{format(startsAt, 'MM[月]DD[日]')}</span>
                </div>
                <div className="detail-card-row">
                  <label>课程时间</label>
                  <span>{format(startsAt, 'HH:mm - ') + format(endsAt, 'HH:mm')}</span>
                </div>
                <div className="detail-card-row">
                  <label>课程详情</label>
                  <span>{order.class.template.description || '这个人很懒，无课程详情'}</span>
                </div>
              </div>
            </div>
          </MasterDetail.Card>
        </div>
        <div className="detail-cards-right">
          {this.payment(order.payments)}
          {this.history(order)}
        </div>
      </div>
    );
  }
}

module.exports = Detail;
