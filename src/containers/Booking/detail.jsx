import './detail.css';
import React from 'react';
import PropTypes from 'prop-types';
import UIFramework from '@weflex/weflex-ui';
import AddBookingView from './add';
import { client } from '../../util/api';
import { UIHistory } from '../../components/ui-history';
import MasterDetail from '../../components/master-detail';
import UIMembershipCard from '../../components/ui-membership-card';
import { format, isAfter } from 'date-fns';
import { find } from 'lodash';
import { FormattedMessage } from 'react-intl';

class BookingInformation extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {tags, actions, memberAvatar, memberName, memberPhone, passcode, createdAt,
      className, classDescription, classTime, trainerName} = this.props;

    return (
      <MasterDetail.Card actions={actions}>
        <div className="detail-card">
          <h3><FormattedMessage id="studio_web_booking_detail_title" /></h3>
          {tags}
          <div className="booking-member">
            {memberAvatar}
            <div className="detail-card-row">
              <label><FormattedMessage id="studio_web_booking_detail_field_order_number" /></label>
              <span>{passcode}</span>
            </div>
            <div className="detail-card-row">
              <label><FormattedMessage id="studio_web_booking_detail_field_order_created_at" /></label>
              <span>{createdAt}</span>
            </div>
            <div className="detail-card-row">
              <label><FormattedMessage id="studio_web_booking_detail_field_user_name" /></label>
              <span>{memberName}</span>
            </div>
            <div className="detail-card-row">
              <label><FormattedMessage id="studio_web_booking_detail_field_mobile_number" /></label>
              <span>{memberPhone}</span>
            </div>
          </div>
          <div className="booking-class">
            <div className="detail-card-row">
              <label><FormattedMessage id="studio_web_booking_detail_field_course_name" /></label>
              <span>{className}</span>
            </div>
            <div className="detail-card-row">
              <label><FormattedMessage id="studio_web_booking_detail_field_course_trainer" /></label>
              <span>{trainerName}</span>
            </div>
            <div className="detail-card-row">
              <label><FormattedMessage id="studio_web_booking_detail_field_course_time" /></label>
              <span>{classTime}</span>
            </div>
            <div className="detail-card-row">
              <label><FormattedMessage id="studio_web_booking_detail_field_course_detail" /></label>
              <span>{classDescription}</span>
            </div>
          </div>
        </div>
      </MasterDetail.Card>
    );
  }
}

class PaymentDetail extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {description, membershipView, membershipText} = this.props;

    return (
      <div className="detail-card booking-payment">
        <h3>费用支付</h3>
        <div className="booking-payment-description">{description}</div>
        <div className="booking-payment-preview">{membershipView}</div>
        <div className="booking-payment-metadata">
          <div className="booking-payment-metadata-container">
            <fieldset>
              <legend>会卡详情</legend>
            </fieldset>
            <div className="detail-card-row">
              <label>会卡种类</label>
              <span>{membershipText.category}</span>
            </div>
            <div className="detail-card-row">
              <label>会卡类型</label>
              <span>{membershipText.accessType}</span>
            </div>
            <div className="detail-card-row">
              <label>剩余次数</label>
              <span>{membershipText.available}次</span>
            </div>
            <div className="detail-card-row">
              <label>开卡时间</label>
              <span>{membershipText.createdAt}</span>
            </div>
            <div className="detail-card-row">
              <label>到期时间</label>
              <span>{membershipText.expiredAt}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class HistoryDetail extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {logs, colors, description} = this.props;

    return (
      <div className="detail-card detail-card-right">
        <h3>订单历史记录</h3>
        <UIHistory data={logs} colors={colors} description={description} />
      </div>
    );
  }
}

class Detail extends React.Component {
  static propTypes = {
    bookingType: PropTypes.string,
    bookingId: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.state = {
      bookingDetail : {
        tags             : '',
        actions          : '',
        memberAvatar     : '',
        memberName       : '',
        memberPhone      : '',
        passcode         : '',
        createdAt        : '',
        className        : '',
        classTime        : '',
        classDescription : '',
        trainerName      : '',
      },
      paymentDetail : {
        description    : '',
        membershipView : '',
        membershipText : {},
      },
      historyDetail : {
        logs         : [],
        colors       : {},
        description  : () => {},
      },
    };

    this.cache = {
      startsAt         : '',
      endsAt           : '',
      status           : [],
    };

    this.onCheckIn = this.onCheckIn.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onViewAddOrder = this.onViewAddOrder.bind(this);
  }

  componentDidMount() {
    const {bookingType, bookingId} = this.props;

    bookingType === 'order'
      ? this.getOrderById(bookingId)
      : this.getPTSessionById(bookingId);
  }

  get title() {
    return '订单管理';
  }

  get actions() {
    return [
      {
        title: '返回',
        onClick: e => window.history.back(),
        disableToggled: true,
      }, {
        title: '创建订单',
        onClick: this.onViewAddOrder,
        disableToggled: true,
      }
    ];
  }

  async getOrderById(id) {
    const order = await client.order.get(id, {
      include: [
        {
          'payments': { 'membership': 'package' },
        },
        {
          'class': ['template', 'trainer'],
        },
        {
          'member': 'avatar',
        }
      ]
    });

    order.payment = order.payments[0];
    order.class = Object.assign(order.class.template, order.class);
    order.trainerName = order.class.trainer.fullname.first + order.class.trainer.fullname.last;
    order.startsAt = order.class.startsAt;
    order.endsAt = order.class.endsAt;
    if(order.payments[0].membership) {
      const reduceMemberships = await client.middleware('/transaction/reduce-memberships', {
        userId: order.userId,
        venueId: order.venueId,
      });
      const reduceMembership = find(reduceMemberships, (item) => {
        return item.membershipId === order.payments[0].membership.id;
      });
      order.payment.membership = Object.assign(order.payments[0].membership, reduceMembership);
    };

    this.updateState(order);
  }

  async getPTSessionById(id) {
    let ptSession = await client.ptSession.get(id, {
      include: [
        {'member': 'avatar'},
        'trainer',
        {'payment': {'membership': 'package'}},
      ],
    });

    const reduceMemberships = await client.middleware('/transaction/reduce-memberships', {
      userId: ptSession.userId,
      venueId: ptSession.venueId,
    });
    const reduceMembership = find(reduceMemberships, (item) => {
      return item.membershipId === ptSession.payment.membership.id;
    });
    ptSession.payment.membership = Object.assign(ptSession.payment.membership, reduceMembership);
    ptSession.trainerName = ptSession.trainer.fullname.first + ptSession.trainer.fullname.last;
    ptSession.class = {
      name: `私教 (${ptSession.trainerName})`,
      description: '无课程详情',
    };

    this.updateState(ptSession);
  }

  updateState(bookingData) {
    const {member, payment, trainerName, startsAt, endsAt} = bookingData;
    const status = this.getStatus(bookingData);

    this.cache = {startsAt, endsAt, status};
    const bookingDetail = {
      tags          : this.getTags(status, endsAt),
      actions       : this.getActions(status, startsAt),
      memberAvatar  : <UIFramework.Image size={80} src={member.avatar} />,
      memberName    : member.nickname,
      memberPhone   : member.phone,
      passcode      : bookingData.passcode,
      createdAt     : format(bookingData.createdAt, 'YYYY年MM月DD日 HH:mm'),
      className     : bookingData.class.name,
      classDescription : bookingData.class.description,
      classTime     : format(startsAt, 'YYYY年MM月DD日 HH:mm ~ ') + format(endsAt, 'HH:mm'),
      trainerName,
    };

    this.setState({
      bookingDetail,
      paymentDetail : this.getPaymentDetail(payment),
      historyDetail : this.getHistoryDetail(status),
    });
  }

  getStatus(bookingData) {
    let status = {'createdAt': bookingData.createdAt};

    if(bookingData.cancelledAt) {
      status['cancelledAt'] = bookingData.cancelledAt;
    }
    if(bookingData.checkedInAt) {
      status['checkedInAt'] = bookingData.checkedInAt;
    };
    return status;
  }

  getTags(status, endsAt) {
    if(status.cancelledAt) {
      return [<span key='cancel' className='status-tag red-bg'>已取消</span>];
    };

    let tags = [];
    if( isAfter(new Date(), endsAt) ) {
      tags.push(<span key='complete' className='status-tag green-bg'>已完成</span>);
    };

    status.checkedInAt
      ? tags.push(<span key='checkIn' className='status-tag green-bg'>已签到</span>)
      : tags.push(<span key='create' className='status-tag'>尚未签到</span>);

    return tags;
  }

  getActions(status, startsAt) {
    if (status.cancelledAt) {
      return [];
    };

    let actions = [<a key="cancel" onClick={this.onCancel}>取消订单</a>];
    if (!status.checkedInAt) {
      actions.push(<a key="checkin" onClick={this.onCheckIn}>签到</a>);
    };
    // if ( isAfter(startsAt, new Date()) ) {
    //   actions.push();
    // };
    return actions;
  }

  getPaymentDetail(payment) {
    let description = '未知方式支付', membershipView = null, membershipText = null;
    if (payment.membership) {
      const membership = Object.assign(payment.membership.package, payment.membership);
      description = `使用 ${membership.name} 抵扣 ${payment.fee} 元`;
      membershipView = <UIMembershipCard data={membership} type="membership"/>;
      membershipText = {
        category   : membership.category === 'group' ? '团课' : '私教',
        accessType : membership.accessType === 'unlimited' ? '不限次卡': '多次卡',
        available  : membership.accessType === 'unlimited'
                       ? '不限': ('available' in membership ? membership.available : 0),
        createdAt  : format(membership.createdAt, 'YYYY年MM月DD日'),
        expiredAt  : 'expiredAt' in membership ? format(membership.expiredAt, 'YYYY年MM月DD日') : '未知',
      };
    } else if (payment && payment._raw) {
      description = (payment._raw.method === 'wechat')
        ? `使用微信支付：${payment.fee} ${payment._raw.currency}`
        : `使用支付宝支付：${payment.fee} ${payment._raw.currency}`;
    };

    return {description, membershipView, membershipText};
  }

  getHistoryDetail(status) {
    let logs = [];
    let statusName = {
      'cancelledAt': 'cancel',
      'checkedInAt': 'checkin',
      'createdAt'  : 'create',
    };
    for(let key in statusName) {
      if(status[key]) {
        logs.push({status: statusName[key], createdAt: status[key]});
      };
    };

    return {
      logs,
      colors      : {
        create   : '#80c7e8',
        cancel   : '#ff8ac2',
        checkin  : '#6ed4a4',
      },
      description : (item) => {
        switch (item.status) {
          case 'create'   : return '预定';
          case 'cancel'   : return '该订单被取消';
          case 'checkin'  : return '场馆签到了课程';
        }
      },
    };
  }

  async onCheckIn() {
    const{bookingId, bookingType} = this.props;
    try {
      bookingType === 'order'
        ? await client.order.checkInById(bookingId)
        : await client.ptSession.checkInById(bookingId);

      this.cache.status.checkedInAt = new Date();
      this.updateStatusChangeState();
    } catch (error) {
      UIFramework.Message.error('签到失败');
    }
  }

  async onCancel() {
    UIFramework.Modal.confirm({
      title: '确认取消该订单?',
      content: '确认取消该订单?',
      onOk: async () => {
        const{bookingId, bookingType} = this.props;
        try {
          bookingType === 'order'
            ? await client.order.cancelById(bookingId)
            : await client.ptSession.cancelById(bookingId);

          this.cache.status.cancelledAt = new Date();
          this.updateStatusChangeState();
        } catch (error) {
          UIFramework.Message.error('取消失败');
        }
      }
    });
  }

  updateStatusChangeState() {
    const {status, startsAt, endsAt} = this.cache;
    let {bookingDetail, historyDetail} = this.state;
    bookingDetail.actions = this.getActions(status, startsAt);
    bookingDetail.tags = this.getTags(status, endsAt);
    historyDetail = this.getHistoryDetail(status);
    this.setState({bookingDetail, historyDetail});
  }

  onViewAddOrder() {
    mixpanel.track( "订单：订单创建");
    this.setState({ modalVisibled: true });
  }

  render() {
    const {bookingDetail, paymentDetail, historyDetail} = this.state;
    return (
      <div className="detail-cards booking-detail-container detail">
        <div className="detail-cards-left">
          <BookingInformation {...bookingDetail} />
        </div>
        <div className="detail-cards-right">
          <PaymentDetail {...paymentDetail} />
          <HistoryDetail {...historyDetail} />
        </div>
        <UIFramework.Modal
            title="添加新订单"
            footer=""
            visible={this.state.modalVisibled}
            onCancel={() => this.setState({modalVisibled: false})}
        >
          <AddBookingView onComplete={() => this.setState({modalVisibled: false})} />
        </UIFramework.Modal>
      </div>
    );
  }
}

module.exports = Detail;
