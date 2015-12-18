'use strict';
const React = require('react');
const SortedTable = require('../sorted/table');
const Order = require('../api/order');

class OrderList extends SortedTable {
  constructor(props) {
    super(props);
  }
  async getDataSource() {
    return await Order.list();
  }
  render() {
    return (
      <SortedTable getDataSource={this.getDataSource}
        columns={[
          {
            title: '课程',
            key: 'prod.title.en'
          },
          {
            title: '开课时间',
            key: 'prod.from',
            type: 'date'
          },
          {
            title: '预订时间',
            key: 'created',
            type: 'date'
          },
          {
            title: '用户',
            key: 'user.nickname'
          },
          {
            title: 'Passcode',
            key: 'passcode'
          },
          {
            title: '订单状态',
            key: 'status'
          }
        ]}>
      </SortedTable>
    );
  }
}

module.exports = OrderList;
