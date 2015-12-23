'use strict';
const React = require('react');
const SortedTable = require('../sorted/table');
const Order = require('../api/order');
const { SearchInput } = require('../toolbar/components/search');

class OrderList extends SortedTable {
  constructor(props) {
    super(props);
  }
  async getDataSource() {
    return await Order.list();
  }
  componentDidMount() {
    const table = this.refs.table;
    SearchInput.Listen('onChange', table.filter.bind(table));
  }
  render() {
    return (
      <SortedTable ref="table"
        getDataSource={this.getDataSource}
        tableHeight={window.innerHeight - 50}
        tableWidth={window.innerWidth - 100}
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
