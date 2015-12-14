import React, {Component} from 'react';
const Order = require('../api/order');
const NavBar = require('../navbar');
const ToolBar = require('../toolbar');

function sortBy (attr) {
  this.setState({sortKey: attr});
  return false;
}

class OrderItem extends Component {
  render () {
    let order = this.props.content;
    return (
      <tr>
        <td>{order.clazz.title.en}</td>
        <td>{order.clazz.venue.name.en}</td>
        <td>{order.clazz.from}</td>
        <td>
          <img className='avatar' src={order.user.avatarUrl}/>
          <span>{order.user.nickname}</span>
        </td>
        <td>{order.passcode}</td>
        <td>{order._raw.time_end}</td>
        <td>{order.status}</td>
      </tr>
    );
  }
}

class Orders extends Component {
  constructor () {
    super();
    this.state = {
      orders: [],
      sortKey: '_raw.time_end'
    };
  }
  async componentDidMount () {
    let orders;
    let token = 'bwoCafmtjR7QrgJQQbmG0UWEcURH4lYdDzN85JG0QoNqLHZ8Yi5qiRifcBIjQTzw';
    orders = await Order.list(token);
    this.setState({orders});
    // TODO: emmit error message;
  }
  render () {
    return (
      <div>
        <NavBar />
        <ToolBar />
        <div className='order-list'>
          <table>
            <caption>Orders</caption>
            <thead>
              <tr>
                <th onClick={sortBy.bind(this, 'clazz.name')} className='filter'>Class Name</th>
                <th>Studio</th>
                <th onClick={sortBy.bind(this, 'clazz.from')} className='filter'>Class Time</th>
                <th>User</th>
                <th>Passcode</th>
                <th onClick={sortBy.bind(this, '_raw.time_end')} className='filter'>Order Time</th>
                <th onClick={sortBy.bind(this, 'status')} className='filter'>Status</th>
              </tr>
            </thead>
            <tbody>
              { this.state.orders.map((order, i) => <OrderItem key={i} content={order} />) }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

module.exports = Orders;
