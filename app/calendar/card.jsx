import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import PopUp from '@weflex/react-portal-tooltip';
import Hammer from 'hammerjs';
import {
  getRoundTime,
  getFormatTime,
  getCellHeight,
  addTimeByHour,
  getGridHeight,
  getDateBySplit,
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

class ClassCard extends React.Component {
  constructor(props) {
    super(props);
    const cellHeight = getCellHeight();
    const height = getGridHeight(this.props.cardInfo.from, this.props.cardInfo.to, cellHeight);
    const top = getGridOffsetByTime(this.props.cardInfo.from, cellHeight);
    this.style = {
      height: height,
      marginTop: top,
      marginLeft: 0,
    };

    this.state = {
      style: this.style,
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

    this.cellHeight = cellHeight;
    this.lastScrollOffset = 0;
  }

  createMoveHanler(hanlder) {
    const hammer = new Hammer(hanlder);
    const classDuration = getTimeDuration(this.props.cardInfo.from, this.props.cardInfo.to);
    hammer.get('pan').set({
      threshold: 0,
    });

    hammer.on('panstart', (event) => {
      this.props.calendar.isDragCard = true;

      const timeToFrom = getTimeDuration(this.props.cardInfo.from, this.props.calendar.state.baselineClock);
      const pointerDay = this.props.calendar.state.atCol;
      this.setState({
        timeToFrom,
        isMove: true,
        fromDay: pointerDay,
      });
      this.lastScrollOffset = this.props.calendar.state.scrollTop;
    });

    hammer.on('pan', (event) => {
      if (this.state.isDrag) {
        return;
      }
      //prevent carlendar to create card
      const createCardStyle =  Object.assign({}, this.props.calendar.state.createCardStyle);
      createCardStyle.height = 0
      this.props.calendar.setState({ createCardStyle })

      const atCol = this.props.calendar.state.atCol;
      const col = this.props.calendar.colList[atCol];
      const height = this.style.height;
      const width = col.right - col.left;
      const hourOffset = -(this.state.timeToFrom / 60);
      const newHourTime = addTimeByHour(this.props.calendar.state.baselineClock, hourOffset);
      const marginLeft = this.style.marginLeft + event.deltaX;
      const marginTop = this.style.marginTop + event.deltaY +
                        this.props.calendar.state.scrollTop -
                        this.lastScrollOffset;

      const style = {
          marginTop,
          marginLeft,
          height,
          width
      };

      this.setState({
        newHourTime,
        style,
      });
    });

    hammer.on('panend', (event) => {
      if (this.state.isDrag) {
        return;
      }
      this.props.calendar.state.isDragCard = false;

      const pointerDay = this.props.calendar.state.atCol;
      const toDay = moment(this.props.cardInfo.date)
                    .add(pointerDay - this.state.fromDay, 'day')
                    .format('YYYY-MM-DD');

      let newFromHour = getRoundTime(this.state.newHourTime);
      if (newFromHour.hour < 0) {
        newFromHour.hour = 0;
        newFromHour.minute = 0;
      }

      let newToHour = addTimeByMinute(newFromHour, classDuration);
      if (newToHour.hour >= 24 && newToHour.minute >= 0) {
        newToHour = {
          hour: 24,
          minute: 0
        }
        newFromHour = addTimeByMinute(newToHour, -classDuration);
      }

      const newCard = this.getNewCard((card) => {
        card.from = newFromHour;
        card.to = newToHour;
        card.date = getDateBySplit(card.from, toDay);
      });
      this.props.updateCard(newCard);
    });
  }

  getNewCard(callback, newTime, date) {
    const newCard = Object.assign({}, this.props.cardInfo);
    callback.call(this, newCard);
    return newCard;
  }

  createResizeHanler(handler, direction) {
    const hammer = new Hammer(handler);
    hammer.get('pan').set({
      direction: Hammer.DIRECTION_VERTICAL,
      threshold: 0
    });

    hammer.on('panstart', (event) => {
      this.setState({ isDrag: true });

      // prevent carlendar to create card
      this.props.calendar.state.isDragCar = true;
    });

    hammer.on('panup pandown', (event) => {
      const createCardStyle =  Object.assign({}, this.props.calendar.state.createCardStyle);
      createCardStyle.height = 0
      this.props.calendar.setState({ createCardStyle })

      let marginTop = this.style.marginTop + event.deltaY;
      let height = this.style.height - event.deltaY;
      if (direction === 'bottom') {
        marginTop = this.style.marginTop;
        height = this.style.height + event.deltaY;
      }

      let isOverDrag = (height <= this.cellHeight);
      if (isOverDrag) {
        let stickBorderTime = this.props.cardInfo.to;
        if (direction === 'bottom') {
          stickBorderTime = this.props.cardInfo.from;
        }
        this.setState({ stickBorderTime });
        return;
      }

      this.setState({
        style: {
          marginTop,
          height
        }
      });
    });

    hammer.on('panend', (event) => {
      this.props.calendar.state.isDragCard = false;

      let height = this.style.height - event.deltaY;
      if (direction === 'bottom') {
        height = this.style.height + event.deltaY;
      }
      let time = this.props.calendar.state.baselineClock;
      const isOverDrag = (height <= this.cellHeight);

      if (isOverDrag) {
        time = this.state.stickBorderTime;
      }
      const newTime = getRoundTime(time);
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
        card.date = getDateBySplit(card.from, this.props.cardInfo.date);
      });

      this.props.updateCard(newCard);
    });
  }

  componentDidMount() {
    const card = this.refs.card;
    const topDragger = this.refs.topDragger;
    const bottomDragger = this.refs.bottomDragger;

    this.createMoveHanler(card);
    this.createResizeHanler(topDragger, 'top');
    this.createResizeHanler(bottomDragger, 'bottom');
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
    this.setState({ isPopUpActive: false });
  }

  disableMouseDown(e) {
    e.preventDefault();
  }

  render() {
    const {id, from, to, date, template, trainer, orders} = this.props.cardInfo;
    const duration = `${getFormatTime(from)} - ${getFormatTime(to)}`;
    const dayOfYear = moment(date).format('MM[月]DD[日]');
    const dayOfWeek = moment(date).format('ddd');
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
