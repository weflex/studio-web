'use strict';
const React = require('react');
const {
  Table,
  Thead,
  Tr, Td, Th
} = require('reactable');

const Order = require('../api/order');
const NavBar = require('../navbar');
const ToolBar = require('../toolbar');

function sortBy (attr) {
  this.setState({sortKey: attr});
  return false;
}

class OrderItem extends React.Component {
  render () {
    let order = this.props.content;
    return (
      <Tr>
        <Td>{order.prod.title.en}</Td>
        <Td>{order.prod.venue.name.en}</Td>
        <Td>{order.prod.from}</Td>
        <Td>
          <img className='avatar' src={order.user.avatarUrl}/>
          <span>{order.user.nickname}</span>
        </Td>
        <Td>{order.passcode}</Td>
        <Td>{order._raw.time_end}</Td>
        <Td>{order.status}</Td>
      </Tr>
    );
  }
}

class Orders extends React.Component {
  constructor () {
    super();
    this.state = {
      orders: [],
      sortKey: '_raw.time_end'
    };
  }
  async componentDidMount () {
    this.setState({
      orders: await Order.list()
    });
  }
  render () {
    return (
      <div>
        <NavBar />
        <ToolBar />
        <div className='order-list'>
          <Table>
            <caption>Orders</caption>
            <Thead>
              <Tr>
                <Th onClick={sortBy.bind(this, 'clazz.name')} className='filter'>Class Name</Th>
                <Th>Studio</th>
                <Th onClick={sortBy.bind(this, 'clazz.from')} className='filter'>Class Time</Th>
                <Th>User</th>
                <Th>Passcode</th>
                <Th onClick={sortBy.bind(this, '_raw.time_end')} className='filter'>Order Time</Th>
                <Th onClick={sortBy.bind(this, 'status')} className='filter'>Status</Th>
              </Tr>
            </Thead>
            {this.state.orders.map((order, i) => <OrderItem key={i} content={order} />)}
          </Table>
        </div>
      </Div>
    );
  }
}

module.exports = Orders;
