"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import PopUp from '@weflex/react-portal-tooltip';

const client = require('@weflex/gian').getClient();
const moment = require('moment');
moment.locale('zh-cn');

function transferToPersent(number) {
  return number * 100 + '%';
}

function getTimeDuration(from, to) {
  return (to.hour - from.hour) * 60 + (to.minute - from.minute);
}

function getGridHeight(from, to, cellHeight) {
  let duration = getTimeDuration(from, to);
  if (duration <= 0) return 0;
  let borderHeight = Math.floor(duration / 60);
  let height = (duration / 60) * cellHeight + borderHeight;
  return height;
}

function getGridOffset(from, cellHeight) {
  let offsetTop = from.minute / 60 * cellHeight;
  return offsetTop;
}

class OrderInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      option: 'all',
    };
    this.options = {
      'paid': '已付款',
      'checkin': '签到',
      'cancel': '取消',
    };
    // this orders is for storing the original orders
    this.orders = [];
  }

  async componentWillUpdate(nextProps, nextState) {
    if (nextProps.classId !== this.props.classId) {
      await this.updateOrders(nextProps.classId);
      return true;
    } else {
      return false;
    }
  }

  async componentDidMount() {
    await this.updateOrders();  
  }

  async updateOrders(classId) {
    // clear
    this.orders = [];
    this.setState({orders: []});
    // set
    this.orders = await client.order.list({
      where: {
        classId: classId || this.props.classId
      },
      include: 'user'
    });
    this.setState({
      orders: this.orders
    });
  }

  selectOption(option) {
    return () => {
      if (option === this.state.option) {
        this.setState({
          option: 'all', 
          orders: this.orders
        });
      } else {
        this.setState({
          option,
          orders: this.orders.filter(o => o.status === option)
        });
      }
    };
  }

  getStatusLable(status) {
    return <div className={`label-${status}`}></div>
  }

  render() {
    const ordersInfo = this.state.orders.map(order => {
      const label = this.getStatusLable(order.status);
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
        <div className={className} key={key} onClick={this.selectOption.call(this, key)}>
          {this.getStatusLable(key)}
          <span>{value}</span>
        </div>
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

// 目前没有用上, 在同一时段有多个事件
function getCardWidth(length) {
  return (1 / length * 100) + '%';
}

function timeFormat(time) {
  if (time.minute < 10) {
    var minute = '0' + time.minute;
  } else {
    var minute = time.minute;
  }
  return `${time.hour}:${minute}`;
}

class ClassCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      style: {},
      isPopUpActive: false,
      id: props.id,
      arrow: 'center',
      position: 'right'
    };
    this.popUpStyle = {
      style: {
        'padding': '10px',
        'minWidth': '200px',
        'minHeight': '220px',
        'background': '#f7f7f7',
        'zIndex': '200',
        'transition': 'all .1s ease-out'
      },
      arrowStyle: {
        'color': '#f7f7f7'
      }
    };
  }

  componentDidMount() {
    const card = ReactDOM.findDOMNode(this.refs.card);
    const cellHeight = card.offsetParent.offsetHeight;
    const height = getGridHeight(this.props.from, this.props.to, cellHeight);
    const top = getGridOffset(this.props.from, cellHeight);
    const style = {
      height: height,
      marginTop: top
    };
    this.setState({style});
  }

  async showPopUp() {
    const card = ReactDOM.findDOMNode(this.refs.card);
    const clientRect = card.getBoundingClientRect();
    const maxHeight = window.innerHeight / 2;
    const maxWidth = window.innerWidth / 2;
    const newState = {};
    newState.isPopUpActive = true;

    if (clientRect.left <= maxWidth && clientRect.top <= maxHeight) {
      newState.position = 'right';
      newState.arrow = 'middle';
    } else if (clientRect.left <= maxWidth) {
      newState.position = 'right';
      newState.arrow = 'bottom';
    } else if (clientRect.top <= maxHeight) {
      newState.position = 'left';
      newState.arrow = 'middle';
    } else {
      newState.position = 'left';
      newState.arrow = 'bottom';
    }
    this.setState(newState);
  }

  hidePopUp() {
    this.setState({isPopUpActive: false});
  }

  render() {
    const duration = `${timeFormat(this.props.from)} -
                    ${timeFormat(this.props.to)}`
    const date = moment(this.props.date).format('MM[月]DD[日]');
    const dayOfWeek = moment(this.props.date).format('ddd');
    const trainer = this.props.template.trainer;
    const trainerName = `${trainer.fullname.first} ${trainer.fullname.last}`;
    return (
      <div
        className='class-card'
        style={this.state.style}
        id={`class_${this.state.id}`}
        onClick={this.showPopUp.bind(this)}
        onMouseLeave={this.hidePopUp.bind(this)}
        ref='card'>
        <p className='class-duration'>
          {duration}
        </p>
        <p>{this.props.template.name}</p>
        <PopUp
          style={this.popUpStyle}
          active={this.state.isPopUpActive}
          parent={`#class_${this.state.id}`}
          arrow={this.state.arrow}
          position={this.state.position}
          transition={0.0}>
          <p className='class-title'>{this.props.template.name}</p>
          <div className='class-date'>
            <span>{date}</span>
            <span>{dayOfWeek}</span>
            <span>{duration}</span>
          </div>
          <div className='trainer'>{trainerName}</div>
          <div className='btn-modify-class'>修改课程</div>
          <OrderInfo classId={this.props.id} />
        </PopUp>
      </div>
    );
  }
}

module.exports = ClassCard;