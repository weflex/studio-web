"use strict";

import React from 'react';
import moment from 'moment';
import { client } from '../../api';
import './detail.css';

class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {}
    };
  }
  async componentWillMount() {
    let user = await client.user.get(this.props.data.userId);
    this.setState({user});
  }
  render() {
    let item = this.props.data;
    return (
      <div className="order-detail-container">
        <div className="order-detail-row">
          <div className="order-detail-head">课程</div>
          <div className="order-detail-column">
            {item.class.template.name}
          </div>
        </div>
        <div className="order-detail-row">
          <div className="order-detail-head">开课时间</div>
          <div className="order-detail-column">
            {moment(item.class.date).format('lll')}
          </div>
        </div>
        <div className="order-detail-row">
          <div className="order-detail-head">订单用户</div>
          <div className="order-detail-column">
            {this.state.user.nickname}
          </div>
        </div>
        <div className="order-detail-row">
          <div className="order-detail-head">课程价格</div>
          <div className="order-detail-column">
            {item.class.template.price}
          </div>
        </div>
        <div className="order-detail-row">
          <div className="order-detail-head">购买价格</div>
          <div className="order-detail-column">
            通过{item.payment.type}支付¥{item.payment.cash}
          </div>
        </div>
        <div className="order-detail-row">
          <div className="order-detail-head">订单状态</div>
          <div className="order-detail-column">
            {item.status}
          </div>
        </div>
        <div className="order-detail-row">
          <div className="order-detail-head">Passcode</div>
          <div className="order-detail-column">
            {item.passcode}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Detail;
