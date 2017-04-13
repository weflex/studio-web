import React from 'react';
import moment from 'moment';
import UIFramework from 'weflex-ui';
import {client} from '../../api';
import {UIHistory} from '../../components/ui-history';
import MasterDetail from '../../components/master-detail';
import UIMembershipCard from '../../components/ui-membership-card';
import {format, isAfter} from 'date-fns';
import {getFormatTime} from '../calendar/util.js';
import './detail.css';

class Detail extends React.Component {
  constructor(props) {
    super(props);
    const {bookingType, bookingId} = props;

    this.state = {
      memberAvatar     : '',
      memberName       : '',
      memberEmail      : '',
      memberPhone      : '',
      bookingTime      : '',
      bookingPasscode  : '',
      className        : '',
      classDescription : '',
      trainerName      : '',
      status           : [],
      startsAt         : '',
      endsAt           : '',
      payment          : {},
    };

    bookingType === 'order'
      ? this.getOrderById(bookingId)
      : this.getPTSessionById(bookingId);
  }

  async getOrderById(id) {
    const order = await client.order.get(id, {
      include: [
        {
          'payments': {
            'membership': [
              {'member': 'avatar'},
              'package',
            ]
          }
        },
        {
          'class': ['template', 'trainer'],
        }
      ]
    });

    let membership = order.payments[0].membership,
      memberAvatar = '',
      memberName = '',
      memberEmail = '',
      memberPhone = '';
    if(membership) {
      memberAvatar = <UIFramework.Image size={80} src={membership.member.avatar} />;
      memberName = membership.member.nickname;
      memberEmail = membership.member.email;
      memberPhone = membership.member.phone;
    };
    this.setState({
      memberAvatar,
      memberName,
      memberEmail,
      memberPhone,
      bookingTime   : format(order.createdAt, 'YYYY年MM月DD日 HH:mm:ss'),
      bookingPasscode  : order.passcode,
      className     : order.class.template.name,
      classDescription : order.class.template.description,
      trainerName   : order.class.trainer.fullname.first
                        + order.class.trainer.fullname.last,
      status        : this.getStatus(order),
      startsAt      : format(order.class.date, 'YYYY-MM-DD ')
                        + getFormatTime(order.class.from),
      endsAt        : format(order.class.date, 'YYYY-MM-DD ')
                        + getFormatTime(order.class.to),
      payment       : order.payments[0],
    });
  }

  async getPTSessionById(id) {
    let ptSession = await client.ptSession.get(id, {
      include: [
        {'member': 'avatar'},
        'trainer',
        {'payment': {'membership': 'package'}},
      ],
    });

    const trainerName = ptSession.trainer.fullname.first + ptSession.trainer.fullname.last;
    this.setState({
      memberAvatar  : <UIFramework.Image size={80} src={ptSession.member.avatar} />,
      memberName    : ptSession.member.nickname,
      memberEmail   : ptSession.member.email,
      memberPhone   : ptSession.member.phone,
      bookingTime      : format(ptSession.createdAt, 'YYYY年MM月DD日 HH:mm:ss'),
      bookingPasscode  : ptSession.passcode,
      className     : `私教 (${trainerName})`,
      classDescription : '',
      trainerName,
      status        : this.getStatus(ptSession),
      startsAt      : ptSession.startsAt,
      endsAt        : ptSession.endsAt,
      payment       : ptSession.payment,
    });
  }

  getStatus(item) {
    let status = {'createdAt': item.createdAt};

    if(item.cancelledAt) {
      status['cancelledAt'] = item.cancelledAt;
    } else if(item.checkedInAt) {
      status['checkedInAt'] = item.checkedInAt;
    };
    return status;
  }

  getStatusTags() {
    const {status, endsAt} = this.state;

    if(status.cancelledAt) {
      return [<span key='cancel' className='status-tag red-bg'>已取消</span>];
    };

    let tags = [];
    if( isAfter(new Date(), endsAt) ) {
      tags.push(<span key='complete' className='status-tag green-bg'>课程已完成</span>);
    };

    status.checkedInAt
      ? tags.push(<span key='checkIn' className='status-tag green-bg'>已签到</span>)
      : tags.push(<span key='checkIn' className='status-tag'>尚未签到</span>);

    return tags;
  }

  getActions() {
    const {status, startsAt} = this.state;
    if (status.cancelledAt) {
      return [];
    };

    let actions = [];
    if (!status.checkedInAt) {
      actions.push(<a key="checkin" onClick={this.onCheckIn.bind(this)}>签到</a>);
    };
    if ( isAfter(startsAt, new Date()) ) {
      actions.push(<a key="cancel" onClick={this.onCancel.bind(this)}>取消订单</a>);
    };
    return actions;
  }

  async onCheckIn () {
    let {status} = this.state;
    const{bookingId, bookingType} = this.props;
    try {
      if (bookingType === 'order') {
        await client.order.checkInById(bookingId);
      } else {
        await client.ptSession.checkInById(bookingId);
      }
      status.checkedInAt = new Date();
      this.setState({status});
    } catch (error) {
      UIFramework.Message.error('签到失败');
    }
  }

  async onCancel() {
    let self = this;
    UIFramework.Modal.confirm({
      title: '确认取消该订单?',
      content: '确认取消该订单?',
      onOk: async () => {
        let {status} = this.state;
        const{bookingId, bookingType} = this.props;
        try {
          if (bookingType === 'order') {
            await client.order.cancelById(bookingId);
          } else {
            await client.ptSession.cancelById(bookingId);
          }
          status.cancelledAt = new Date();
          this.setState({status});
        } catch (error) {
          UIFramework.Message.error('取消失败');
        }
      }
    });
  }

  renderPayment(payment) {
    let description = '未知方式支付';
    let preview = null;
    let metadata = null;
    if(payment.membership) {
      const membership = Object.assign(payment.membership.package, payment.membership);
      description = `使用 ${membership.name} 抵扣 ${payment.fee} 元`;
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
            <span>{format(membership.createdAt, 'YYYY年MM月DD日')}</span>
          </div>
          {
            'expiredAt' in membership ?
            <div className="detail-card-row">
              <label>到期时间</label>
              <span>
                {format(membership.expiredAt, 'YYYY年MM月DD日')}
              </span>
            </div> : null
          }
        </div>
      );
    } else if (payment && payment._raw) {
      description = (payment._raw.method === 'wechat')
        ? `使用微信支付：${payment.fee} ${payment._raw.currency}`
        : `使用支付宝支付：${payment.fee} ${payment._raw.currency}`;
    };
    return (
      <div className="detail-card order-payment">
        <h3>费用支付</h3>
        <div className="order-payment-description">{description}</div>
        <div className="order-payment-preview">{preview}</div>
        <div className="order-payment-metadata">{metadata}</div>
      </div>
    );
  }

  renderHistory(status) {
    var logs = [];
    ['cancelledAt', 'checkedInAt', 'createdAt'].map((field) => {
      let statu;
      if (status[field]) {
        switch (field) {
        case 'cancelledAt':
          statu = 'cancel';
          break;
        case 'checkedInAt':
          statu = 'checkin';
          break;
        default:
          statu = 'create';
          break;
        }
        logs.push({status: statu, createdAt: status[field]});
      }
    });
    return (
      <div className="detail-card detail-card-right">
        <h3>订单历史记录</h3>
        <UIHistory
          data={logs}
          colors={{
            create   : '#80c7e8',
            cancel   : '#ff8ac2',
            checkin  : '#6ed4a4',
          }}
          description={(item) => {
            switch (item.status) {
              case 'create'   : return '用户预定了课程';
              case 'cancel'   : return '用户取消了预定';
              case 'checkin'  : return '用户签到了课程';
            }
          }}
        />
      </div>
    );
  }

  render() {
    const {memberAvatar, memberName, memberEmail, memberPhone, bookingTime,
      bookingPasscode, className, classDescription, trainerName, status,
      startsAt, endsAt, payment} = this.state;

    return (
      <div className="detail-cards order-detail-container detail">
        <div className="detail-cards-left">
          <MasterDetail.Card actions={this.getActions()}>
            <div className="detail-card" style={{height: '100%'}}>
              <h3>订单主要信息</h3>
              {this.getStatusTags()}
              <div className="order-member">
                {memberAvatar}
                <div className="detail-card-row">
                  <label>订单号</label>
                  <span>{bookingPasscode}</span>
                </div>
                <div className="detail-card-row">
                  <label>订单时间</label>
                  <span>{bookingTime}</span>
                </div>
                <div className="detail-card-row">
                  <label>用户</label>
                  <span>{memberName}</span>
                </div>
                <div className="detail-card-row">
                  <label>手机号码</label>
                  <span>{memberPhone}</span>
                </div>
                <div className="detail-card-row">
                  <label>电子邮箱</label>
                  {
                    memberEmail.endsWith('theweflex.com')
                      ? <span>未设置</span>
                      : <a href={'mailto:' + memberEmail}>{memberEmail}</a>
                  }
                </div>
              </div>
              <div className="order-class">
                <div className="detail-card-row">
                  <label>报名课程</label>
                  <span>{className}</span>
                </div>
                <div className="detail-card-row">
                  <label>课程教练</label>
                  <span>{trainerName}</span>
                </div>
                <div className="detail-card-row">
                  <label>课程时间</label>
                  <span>
                    {format(startsAt, 'YYYY年MM月DD日 HH:ss ~ ') + format(endsAt, 'HH:ss')}
                  </span>
                </div>
                <div className="detail-card-row">
                  <label>课程详情</label>
                  <span>{classDescription || '无课程详情'}</span>
                </div>
              </div>
            </div>
          </MasterDetail.Card>
        </div>
        <div className="detail-cards-right">
          {this.renderPayment(payment)}
          {this.renderHistory(status)}
        </div>
      </div>
    );
  }
}

module.exports = Detail;
