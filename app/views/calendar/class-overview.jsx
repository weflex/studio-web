"use strict"

import _ from 'lodash';
import React from 'react';
import moment from 'moment';
import { DropModal } from 'boron2';
import { NewClassTemplate } from './new';
import { getFormatTime } from './util'
moment.locale('zh-cn');

/**
 * The `OrderInfo` is used for showing the order of every class
 * at calendar.
 *
 * @class OrderInfo
 */
class OrderInfo extends React.Component {

  /**
   * To initialize an OrderInfo, the constructor function
   * does set the following states:
   * 
   * - orders
   * - option
   *
   * @constructor
   */
  constructor(props) {
    super(props);
    this.state = {
      option: 'all',
    };
    this.options = {
      'paid': '已付款',
      'checkin': '签到',
      'cancel': '取消',
    };
  }

  /**
   * @method selectOption
   * @private
   * @param {Object} option
   */
  selectOption(option) {
    return () => {
      if (option === this.state.option) {
        this.setState({
          option: 'all',
          orders: this.props.orders
        });
      } else {
        this.setState({
          option,
          orders: this.props.orders.filter(o => o.status === option)
        });
      }
    }
  }

  /**
   * @method getStatusLabel
   * @private
   * @param {String} status
   */
  getStatusLabel(status) {
    return <div className={`label-${status}`}></div>
  }

  /**
   * @method render
   * @return {Element}
   */
  render() {
    const ordersInfo = this.props.orders.map((order) => {
      const label = this.getStatusLabel(order.status);
      return (
        <li key={`order_${order.id}`}>{label} {order.user.nickname}</li>
      );
    });

    const selectButtons = [];
    for (let key in this.options) {
      let value = this.options[key];
      let className = `btn-${key}`;
      if (this.state.option === key) {
        className += ' selected';
      }

      selectButtons.push(
        <li className={className} key={key} onClick={this.selectOption.call(this, key)}>
          {this.getStatusLabel(key)}
          <span className={key}>{value}</span>
        </li>
      );
    }

    return (
      <div className="order-info">
        <div className="divider"></div>
        <div className="order-info-users">
          <p>已登记用户:</p>
          {ordersInfo}
        </div>
        <ul className="order-info-selection">
          {selectButtons}
        </ul>
      </div>
    );
  }
}

class ClassOverview extends React.Component {
  constructor(props) {
    super(props);
  }
  showClassDetail() {
    this.refs.classDetailModal.show();
  }
  render() {
    const { template, date, from, to, trainer, orders } = this.props.data;
    const duration = `${moment(date).format('ddd')} ${getFormatTime(from)} - ${getFormatTime(to)}`
    const trainerName = `${trainer.fullname.first} ${trainer.fullname.last}`;
    return (
      <div className="class-overview">
        <p className="class-title">{template.name}</p>
        <div className="class-date">
          <span>{moment(date).format('MM[月]DD[日]')}</span>
          <span>{duration}</span>
        </div>
        <div className="trainer">{trainerName}</div>
        <div className="btn-modify-class" 
          onClick={this.showClassDetail.bind(this)}>修改课程</div>
        <OrderInfo orders={orders} />
        <DropModal ref="classDetailModal">
          <NewClassTemplate data={this.props.data} />
        </DropModal>
      </div>
    );
  }
}

module.exports = ClassOverview;
