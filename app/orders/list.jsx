"use strict";
require('./list.css');

const React = require('react');
const { SearchInput } = require('../toolbar/components/search');
const client = require('@weflex/gian').getClient('dev');

class OrderList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      selected: null
    };
  }
  async componentDidMount() {
    this.setState({
      data: await client.order.list({
        include: ['classPackage', 'user']
      })
    });
  }
  render() {
    return (
      <div className="orders">
        {this.renderListTable(this.state.data)}
        {this.renderListView(this.state.data[this.state.selected])}
      </div>
    )
  }
  renderListTable(listData) {
    return (
      <div className="list-table">
        <div className="list-table-header">
          <div className="list-table-column">订单时间</div>
          <div className="list-table-column">卡种选择</div>
          <div className="list-table-column">客户</div>
          <div className="list-table-column">有效期</div>
        </div>
        <div className="list-table-rows">
          {listData.map((item, index) => {
            return (
              <div className="list-table-row" key={index} onClick={() => {
                this.setState({selected: index})
              }}>
                <div className="list-table-column">{item.created}</div>
                <div className="list-table-column">{item.productType}</div>
                <div className="list-table-column">{item.user}</div>
                <div className="list-table-column">{item.expiredDate}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  renderListView(viewData) {
    viewData = viewData || {};
    return (
      <div className="list-view">
        <div className="list-view-header">订单详情</div>
        <div className="list-view-content">
          <div className="list-view-fieldset">
            <label>订单时间</label>
            <span>{viewData.created}</span>
          </div>
          <div className="list-view-fieldset">
            <label>卡种类型</label>
            <span>{viewData.productType}</span>
          </div>
          <div className="list-view-fieldset">
            <label>有效期</label>
            <span>{viewData.expiredDate}</span>
          </div>
          <div className="list-view-fieldset">
            <label>使用次数</label>
            <span>1次</span>
          </div>
          <div className="list-view-fieldset">
            <label>剩余次数</label>
            <span>1次</span>
          </div>
          <div className="list-view-fieldset">
            <label>客户</label>
            <span>{viewData.user}</span>
          </div>
          <div className="list-view-fieldset">
            <label>付款方式</label>
            <span>支付宝</span>
          </div>
          <div className="list-view-fieldset">
            <label>金额</label>
            <span>300元人民币</span>
          </div>
        </div>
        <div className="list-view-footer">

        </div>
      </div>
    );
  }
}

module.exports = OrderList;
