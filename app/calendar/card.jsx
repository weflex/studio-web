import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import PopUp from '@weflex/react-portal-tooltip';
import Hammer from 'hammerjs';
import {
  getCellHeight,
  addTimeByHour,
  getGridHeight,
  getTimeDuration,
  addTimeByMinute,
  getGridOffsetByTime,
  transferToPercentage,
} from './util.js'

moment.locale('zh-cn');


class OrderInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: this.props.orders,
      option: 'all',
    };

    this.options = {
      'paid': '已付款',
      'checkin': '签到',
      'cancel': '取消',
    };
  }

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

  getStatusLabel(status) {
    return <div className={`label-${status}`}></div>
  }

  render() {
    const ordersInfo = this.state.orders.map((order) => {
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

// 目前没有用上, 在同一时段有多个事件
function getCardWidth(length) {
  return (1 / length * 100) + '%';
}

function timeFormat(time) {
  let hour, minute;

  if (time.minute < 10) {
     minute = '0' + time.minute;
  } else {
     minute = time.minute;
  }

  if (time.hour < 10) {
     hour = '0' + time.hour;
  } else {
     hour = time.hour;
  }

  return `${hour}:${minute}`;
}

class ClassCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      style: {
        height: 0,
        marginTop: 0,
        marginLeft: 0,
      },
      isDrag: false,
      isMove: false,
      arrow: 'center',
      position: 'right',
      isPopUpActive: false,
    };
    this.popUpStyle = {
      style: {
        'zIndex': '200',
        'padding': '10px',
        'minWidth': '200px',
        'minHeight': '220px',
        'background': '#f7f7f7',
        'transition': 'all .1s ease-out'
      },
      arrowStyle: {
        'color': '#f7f7f7'
      }
    };
    this.cellHeight = 0;
  }

  createMoveHanler(hanlder) {
    const hammer = new Hammer(hanlder);
    const classDuration = getTimeDuration(this.props.cardInfo.from, this.props.cardInfo.to);

    Hammer.on(hanlder, 'click', function (ev) {
      ev.preventDefault();
    });

    hammer.get('pan').set({
      threshold: 0
    });

    hammer.on('panstart', (ev) => {
      const timeToFrom = getTimeDuration(this.props.cardInfo.from, this.props.baselineClock);
      this.setState({
        timeToFrom
      });
    });

    hammer.on('pan', (ev) => {
      if (this.state.isDrag) return;

      const marginTop = this.style.marginTop + ev.deltaY;
      const height = this.style.height;
      const hourOffset = -(this.state.timeToFrom / 60);
      const from = addTimeByHour(this.props.baselineClock, hourOffset);
      this.setState({
        from,
        style: {
          marginTop,
          height,
        },
        isMove: true,
      });
    });


    hammer.on('panend', (ev) => {
      if (this.state.isDrag) return;
      const newTime = this.getRoundTime(this.state.from);
      const newCard = this.getNewCard(function (card) {
        card.from = newTime;
        card.to = addTimeByMinute(newTime, classDuration);
      }, newTime);
      this.props.updateCard(newCard);
    });
  }

  getRoundTime(time) {
    const {minute} = time;
    const newTime = Object.assign({}, time);
    if (0 <= minute && minute <= 29) {
      if (minute <= 14) {
        newTime.minute = 0;
      } else {
        newTime.minute = 30;
      }
    } else if (minute > 29) {
      if (minute > 44) {
        newTime.minute = 0;
        newTime.hour = newTime.hour + 1;
      } else {
        newTime.minute = 30;
      }
    }
    return newTime;
  }

  getNewCard(callback, newTime) {
    const newCard = Object.assign({}, this.props.cardInfo);
    const oldDate = moment(this.props.cardInfo.date).format('YYYY-MM-DD');
    newCard.date = new Date(oldDate + ` ${timeFormat(newTime)}`);
    callback.call(this, newCard);
    return newCard;
  }

  createDragger(dragger, direction) {
    const hammer = new Hammer(dragger);

    Hammer.on(dragger, 'click', function (ev) {
      ev.stopPropagation();
    });

    hammer.get('pan').set({
      direction: Hammer.DIRECTION_VERTICAL,
      threshold: 0
    });

    hammer.on('panup pandown', (ev) => {
      console.log('a');
      let marginTop = this.style.marginTop + ev.deltaY;
      let height = this.style.height - ev.deltaY;
      if (direction === 'bottom') {
        marginTop = this.style.marginTop;
        height = this.style.height + ev.deltaY;
      }

      let isOverDrag = (height <= this.cellHeight);
      if (isOverDrag) {
        let stickBorderTime = this.props.cardInfo.to;
        if (direction === 'bottom') {
          stickBorderTime = this.props.cardInfo.from;
        }
        this.setState({stickBorderTime});
        return;
      }

      this.setState({
        style: {
          marginTop,
          height
        },
        isDrag: true
      });
    });

    hammer.on('panend', (ev) => {

      let height = this.style.height - ev.deltaY;
      if (direction === 'bottom') {
        height = this.style.height + ev.deltaY;
      }
      let time = this.props.baselineClock;
      const isOverDrag = (height <= this.cellHeight);

      if (isOverDrag) {
        time = this.state.stickBorderTime;
      }
      const newTime = this.getRoundTime(time);
      const newCard = this.getNewCard(function (card) {
        if (direction === 'bottom') {
          card.to = newTime;
          if (isOverDrag) {
            card.from = newTime;
            card.to = addTimeByHour(newTime, 1);
          }
        } else if (direction === 'top') {
          card.from = newTime;
          if (isOverDrag) {
            card.to = newTime;
            card.from = addTimeByHour(newTime, -1);
          }
        }
      }, newTime);

      this.props.updateCard(newCard);
    });
  }

  componentDidMount() {
    const cellHeight = getCellHeight();
    const height = getGridHeight(this.props.cardInfo.from, this.props.cardInfo.to, cellHeight);
    const top = getGridOffsetByTime(this.props.cardInfo.from, cellHeight);
    this.style = {
      height: height,
      marginTop: top,
      marginLeft: 0
    };
    this.cellHeight = cellHeight;

    const card = this.refs.card;
    const topDragger = this.refs.topDragger;
    const bottomDragger = this.refs.bottomDragger;

    this.createMoveHanler(card);
    this.createDragger(topDragger, 'top');
    this.createDragger(bottomDragger, 'bottom');

    this.setState({
      style: this.style,
    });
  }

  showPopUp(e) {
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

  disableMouseDown(e) {
    e.preventDefault();
  }

  render() {
    const {id, from, to, date, template, orders} = this.props.cardInfo;
    const duration = `${timeFormat(from)} - ${timeFormat(to)}`;
    const dayOfYear = moment(date).format('MM[月]DD[日]');
    const dayOfWeek = moment(date).format('ddd');
    const trainer = template.trainer;
    const trainerName = `${trainer.fullname.first} ${trainer.fullname.last}`;
    let className = 'class-card';
    if (this.state.isDrag) {
      className += ' dragged';
    } else if (this.state.isMove) {
      className += ' moved';
    }

    return (
      <div
        className={className}
        style={this.state.style}
        id={`class_${id}`}
        onMouseLeave={this.hidePopUp.bind(this)}
        onClick={this.showPopUp.bind(this)}
        onMouseDown={this.disableMouseDown}
        ref="card">
        <div className="top-dragger" ref="topDragger"></div>
        <p className="class-duration" >
          {duration}
        </p>
        <p>{template.name}</p>
        <div className="bottom-dragger" ref="bottomDragger"></div>
        <PopUp
          style={this.popUpStyle}
          active={this.state.isPopUpActive}
          parent={`#class_${id}`}
          arrow={this.state.arrow}
          position={this.state.position}
          transition={0.0}>
          <p className="class-title">{template.name}</p>
          <div className="class-date">
            <span>{dayOfYear}</span>
            <span>{dayOfWeek}</span>
            <span>{duration}</span>
          </div>
          <div className="trainer">{trainerName}</div>
          <div className="btn-modify-class">修改课程</div>
          <OrderInfo orders={orders} />
        </PopUp>
      </div>
    );
  }
}

module.exports = ClassCard;
