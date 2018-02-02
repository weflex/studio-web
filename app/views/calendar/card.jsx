import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import PopUp from 'react-portal-tooltip';
import Hammer from 'hammerjs';
import moment from 'moment';
import UIFramework from '@weflex/weflex-ui';
import { Popover } from 'antd'
import {
  getFormatTime,
  getCellHeight,
  getGridHeight,
  getGridOffsetByTime
} from './util'
import HourMinute from '../../lib/hour-minute';
moment.locale('zh-cn');

/**
 * The `ClassCard` class is for standing a card for class,
 * this class does handle with the move, create and position about
 * this card
 *
 * @class ClassCard
 */
class ClassCard extends React.Component {

  /**
   * The constructor of `ClassCard` does define the following state:
   *
   * - style
   * - isResizing
   * - isMoving
   * - isEditing
   * - arrow: default value is 'center'
   * - position: default value is 'right'
   * - isPopUpActive: default value is false
   * - lastScrollOffset
   *
   * @constructor
   */
  constructor(props) {
    super(props);
    // Get the cell height
    const cellHeight = getCellHeight();
    // Compute the grid height by from and to
    const height = getGridHeight(
      this.props.cardInfo.from,
      this.props.cardInfo.to,
      cellHeight);
    // Get the topPostion by from and cell height
    const topPostion = getGridOffsetByTime(
      this.props.cardInfo.from,
      cellHeight);

    // Set the style
    this.style = {
      height: height,
      marginTop: topPostion,
      marginLeft: 0,
      width: 100 / this.props.total + '%'
    };

    // Attach the cellHeight to instance for later uses
    this.cellHeight = cellHeight;
    // The `popUpStyle` of the instance is cover the style of popup component
    this.popUpStyle = {
      style: {
        zIndex: '200',
        padding: '10px',
        minWidth: '200px',
        minHeight: '220px',
        background: '#f7f7f7',
        transition: 'all .1s ease-out'
      },
      arrowStyle: {
        color: '#f7f7f7'
      }
    };
    this.state = {
      style: this.style,
      isResizing: this.props.isResizing || false,
      isMoving: this.props.isMoving || false,
      arrow: 'center',
      position: 'right',
      isPopUpActive: false,
      lastScrollOffset: 0,
      date: this.props.cardInfo.date,
      from: this.props.cardInfo.from,
      to: this.props.cardInfo.to
    };
  }

  // TODO(Yorkie): use getter
  /**
   * @method isCardDragging
   * @return {Boolean} return if the card is dragging.
   */
  isCardDragging() {
    return this.isMouseDown;
  }

  /**
   * @method getSnapToValueOnMoving
   * @param {Object} time - the time to snap to
   * @return {Object} return {from: n, to: m}
   */
  getSnapToValueOnMoving(time, duration) {
    const from = (new HourMinute(time)).snapToMinutes(10);
    const to = from.adding(duration);
    return {
      from,
      to
    };
  }

  /**
   * @method createMoveHandler
   * @param {Function} handler
   */
  createMoveHanler(handler) {
    if (!this.moveHammer) {
      delete this.moveHammer;
    }
    this.moveHammer = new Hammer.Manager(handler);
    this.moveHammer.add(new Hammer.Pan());

    // Get the duration of class by from and to
    const cardInfo = this.props.cardInfo;
    const classDuration = (new HourMinute(cardInfo.to)).subtract(cardInfo.from);
    this.moveHammer.get('pan').set({
      threshold: 0,
    });

    this.moveHammer.on('panstart', (event) => {
      const calendar = this.props.calendar;
      if (this.state.isResizing) {
        return;
      }
      let timeToFrom;
      if (this.props.isEmptyFrom) {
        let relativeY;
        if (window.TouchEvent && event.srcEvent instanceof window.TouchEvent) {
          const cardTop = this.refs.card.getBoundingClientRect().top;
          relativeY = event.srcEvent.changedTouches[0].clientY - cardTop;
        } else {
          relativeY = event.srcEvent.layerY;
        }
        // FIXME(Yorkie): the `timeToFrom` should be converted to be the value relative
        // to calendar's cellHeight
        timeToFrom = 60 * relativeY / calendar.props.cellHeight;
      } else {
        timeToFrom = new HourMintue(calendar.baselineClock)
          .subtract(cardInfo.from)
          .asMinutes();
      }

      this.setState({
        timeToFrom,
        isMoving: true,
        lastScrollOffset: calendar.state.scrollTop,
      });

      if (typeof this.props.onPanStart === 'function') {
        this.props.onPanStart(event);
      }
    });

    this.moveHammer.on('pan', (event) => {
      if (this.state.isResizing) {
        return;
      }
      const calendar = this.props.calendar;
      // FIXME(Yorkie): Call setBaseline when doing pan on card
      if (typeof calendar.setBaseline === 'function') {
        calendar.setBaseline.call(calendar, event.srcEvent);
      }

      const col = calendar.colList[1];
      const height = this.style.height;
      const width = col.right - col.left;
      const timeOffset = -this.state.timeToFrom;
      const extraCompensation = 5 /* minutes */;
      const newHourTime = (new HourMinute(calendar.baselineClock))
        .addMinutes(timeOffset)
        .addMinutes(extraCompensation);
      const marginLeft = this.style.marginLeft + event.deltaX;
      const marginTop = this.style.marginTop + event.deltaY +
        calendar.state.scrollTop -
        this.state.lastScrollOffset;

      const style = {
        marginTop,
        marginLeft,
        height,
        width
      };

      const date = moment(calendar.baselineDate).format('YYYY-MM-DD');
      const { from, to } = this.getSnapToValueOnMoving(newHourTime, classDuration);
      this.setState({
        newHourTime,
        style,
        date,
        from,
        to,
      });
    });

    this.moveHammer.on('panend', (event) => {
      const calendar = this.props.calendar;
      if (this.state.isResizing) {
        return;
      }
      const newCard = this.getNewCard((card) => {
        card.date = this.state.date;
        card.from = this.state.from;
        card.to = this.state.to;
      });
      if (typeof this.props.onPanEnd === 'function') {
        this.props.onPanEnd(event, newCard);
      }
    });
  }

  /**
   * @method getNewCard
   * @param {Function} callback
   * @param {Date} newTime
   * @param {Date} date
   * @return {Object} return the new generated card information
   */
  getNewCard(callback, newTime, date) {
    const newCard = Object.assign({}, this.props.cardInfo);
    callback.call(this, newCard);
    return newCard;
  }

  /**
   * Open the popup
   *
   * @method showPopUp
   */
  showPopUp(e) {
    const calendar = this.props.calendar;
    if (this.props.isEmptyFrom ||
      (calendar && calendar.state.isEditing)) {
      // don't show popup when in editing
      return;
    }
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

  /**
   * Hide the popup
   * @method hidePopUp
   */
  hidePopUp() {
    this.setState({ isPopUpActive: false })
  }

  /**
   * @method onMouseDown
   */
  onMouseDown(event) {
    event.preventDefault();
    this.isMouseDown = true;
    if (typeof this.props.onMouseDown === 'function') {
      this.props.onMouseDown(event);
    }
  }

  /**
   * @method onMouseUp
   */
  onMouseUp(event) {
    event.preventDefault();
    this.isMouseDown = false;
    if (typeof this.props.onMouseUp === 'function') {
      this.props.onMouseUp(event);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.style.width = 100 / nextProps.total + '%'
    this.setState({ style: this.style });
  }

  /**
   * This is the delegate of this component when component 
   * did finish mountation.
   *
   * @method componentDidMount
   */
  componentDidMount() {
    const card = this.refs.card;

    if (!this.props.moveDisabled) {
      this.createMoveHanler(card);
    }
  }

  createHoverInfo() {
    return (<div className="card-hover">2</div>)

  }

  /**
   * @method render
   */
  render() {
    const {
      id,
      date,
      from,
      to,
      template,
      orders,
      trainer,
      spotsAvailable,
      spot,
      spotsBooked,
      notifyMembers,
      members
    } = this.props.cardInfo;
    const calendar = this.props.calendar;
    const duration = '' + moment(this.state.date).format('ddd') +
      ' ' + getFormatTime(this.state.from) + ' - ' + getFormatTime(this.state.to);

    let hideButton, classNameColor = {};
    let onClickThis = this.showPopUp.bind(this);
    let className = 'class-card';
    let style = Object.assign({},
      this.state.style, this.props.style);
    if (!trainer || Object.keys(trainer).length == 0) {
      style = Object.assign(style, { backgroundColor: "#FF8AC2" })
    } else if (spotsAvailable > 0) {
      style = Object.assign(style, { backgroundColor: "#80C7E8" })
      classNameColor = {
        color: 'white!important'
      }
    }

    if (this.props.className) {
      className += ' ' + this.props.className;
    }
    if (this.state.isResizing) {
      className += ' resized';
    } else if (this.state.isMoving) {
      className += ' moved';
    }

    if (calendar && calendar.state.isEditing) {
      let onHide;
      className += ' animated infinite shake';
      if (this.props.ctx) {
        onHide = (event) => {
          this.props.ctx.deleteClass(this.props.cardInfo);
        };
        // FIXME(Yorkie): When in edit mode, `onClickThis` should be disable
        onClickThis = null;
      }
      hideButton = (
        <div
          className="class-close-btn"
          onClick={onHide}>
          <span className="icon-font icon-cancel"></span>
        </div>
      );
    }

    let popupView = null;
    if (this.props.popupEnabled) {
      popupView = (
        <PopUp
          style={this.popUpStyle}
          active={this.state.isPopUpActive}
          parent={`#class_${id}`}
          arrow={this.state.arrow}
          position={this.state.position}
          transition={0.0}>
          <this.props.popupTemplate
            data={this.props.cardInfo}
            {...this.props.popupProps}
          />
        </PopUp>
      );
    }
    const trigger = notifyMembers ? 'hover' : ''
    let waitMember = [], number = 0
    if (notifyMembers) {
      if (members) {
        members.map((item, index) => {
          waitMember.push(
            <p key={index}>
              <span>{item.nickname + ':'}</span><span>{item.user.phone}</span>
            </p>
          )
        })
        number = notifyMembers.length
      }
    }
    const content = (
      <div className='wait-queue'>
        {waitMember}
      </div>
    );
    const title = '课程报名：' + spotsBooked + '/' + spot + "  通知候补：" + number

    return (
      <Popover content={content} title={title} trigger={trigger} >
        <div
          className={className}
          style={style}
          id={`class_${id}`}
          onMouseLeave={this.hidePopUp.bind(this)}
          onClick={onClickThis}
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseUp={this.onMouseUp.bind(this)}
          ref="card">
          <div className="class-name" style={classNameColor}>{template.name}</div>
          {hideButton}
          {popupView}
        </div>
      </Popover>
    );
  }
}

module.exports = ClassCard;
