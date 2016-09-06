"use strict"

import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import UIFramework from 'weflex-ui';
import { NewClassTemplate } from './new';
import { getFormatTime } from './util'
import { client } from '../../api';
moment.locale('zh-cn');

class OrderLine extends React.Component {
  constructor(props) {
    super(props);
    let status = 'paid';
    const order = props.data;
    if (order.checkedInAt) {
      status = 'checkin';
    }
    if (order.cancelledAt) {
      status = 'cancel';
    }
    this.state = {
      status,
    };
  }
  async onClickCheckin(event) {
    this.setState({
      status: 'checkin',
    });
    await client.order.checkInById(this.props.data.id);
    UIFramework.Message.success('签到成功');
  }

  async onClickCancel(event) {
    this.setState({
      status: 'cancel',
    });
    await client.order.cancelById(this.props.data.id);
    UIFramework.Message.success('取消成功');
  }
  render() {
    let userStatus;
    if (this.state.status !== 'checkin' &&
      this.state.status !== 'cancel') {
      userStatus = (
        <div className="order-info-user-status">
          <button onClick={this.onClickCheckin.bind(this)}>签到</button>
          <button onClick={this.onClickCancel.bind(this)}>取消</button>
        </div>
      );
    } else {
      userStatus = (
        <div className="order-info-user-status">
          <span>{this.state.status === 'checkin' ? '已签到' : '已取消'}</span>
        </div>
      );
    }
    const userIconClassName = [
      'order-info-user-icon',
      'order-info-user-icon-' + this.state.status,
    ];
    return (
      <div className="order-info-user">
        <div className={userIconClassName.join(' ')}></div>
        <div className="order-info-user-name">
          {this.props.data.user.nickname}
        </div>
        {userStatus}
      </div>
    );
  }
}

/**
 * The `OrderInfo` is used for showing the order of every class
 * at calendar.
 *
 * @class OrderInfo
 */
class OrdersInfo extends React.Component {

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
      orders: props.data,
    };
  }

  /**
   * @method render
   * @return {Element}
   */
  render() {
    return (
      <div className="order-info">
        <div className="order-info-users">
          <fieldset>
            <legend>已登记用户</legend>
          </fieldset>
          <ul>
            {this.state.orders.map((order, idx) => {
              return <OrderLine data={order} key={idx} />;
            })}
          </ul>
        </div>
      </div>
    );
  }
}

class ClassOverview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisibled: false,
    };
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
          onClick={() => this.setState({modalVisibled: true})}>修改课程</div>
        <OrdersInfo data={orders} />
        <UIFramework.Modal
          visible={this.state.modalVisibled}
          title="修改课程"
          footer=""
          onCancel={() => this.setState({modalVisibled: false})}>
          <NewClassTemplate 
            data={this.props.data} 
            onCreateClass={(newClass) => {
              this.setState({modalVisibled: false});
              this.props.onCreateClass(newClass);
            }}
          />
        </UIFramework.Modal>
      </div>
    );
  }
}

module.exports = ClassOverview;
