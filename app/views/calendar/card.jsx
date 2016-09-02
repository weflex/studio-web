import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import PopUp from 'react-portal-tooltip';
import Hammer from 'hammerjs';
import moment from 'moment';
import UIFramework from 'weflex-ui';
import {
  getFormatTime,
  getCellHeight,
  getGridHeight,
  getDateBySplit,
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
      width: 100/this.props.total + '%'
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
      to: this.props.cardInfo.to,
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
      const calendar = this.props.calendar || this.ctx.calendar;
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
        timeToFrom = new HourMintue(calendar.state.baselineClock)
          .subtract(cardInfo.from)
          .asMinutes();
      }

      const pointerDay = calendar.state.atCol;
      this.setState({
        timeToFrom,
        isMoving: true,
        fromDay: this.props.isEmptyFrom ? 1 : pointerDay,
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
      const calendar = this.props.calendar || this.ctx.calendar;
      // FIXME(Yorkie): Call setBaseline when doing pan on card
      if (typeof calendar.setBaseline === 'function') {
        calendar.setBaseline.call(calendar, event.srcEvent);
      }

      const atCol = calendar.state.atCol;
      const col = calendar.colList[atCol];
      const height = this.style.height;
      const width = col.right - col.left;
      const timeOffset = -this.state.timeToFrom;
      const newHourTime = (new HourMinute(calendar.state.baselineClock)).addMinutes(timeOffset);
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

      const pointerDay = calendar.state.atCol;
      const toDay = moment(this.props.cardInfo.date)
        .add(pointerDay - this.state.fromDay + 1, 'day')
        .format('YYYY-MM-DD');
      const date = getDateBySplit(from, toDay);
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
      const calendar = this.props.calendar || this.ctx.calendar;
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
   * @method createResizeHanler
   * @param {Function} handler
   * @param {String} direction
   */
  createResizeHanler(handler, direction) {
    // TODO(Yorkie): keep consistence with `moveHammer`.
    const resizeHammer = new Hammer(handler);
    resizeHammer.get('pan').set({
      direction: Hammer.DIRECTION_VERTICAL,
      threshold: 0
    });

    resizeHammer.on('panstart', (event) => {
      this.setState({ isResizing: true });
    });

    resizeHammer.on('panup pandown', (event) => {
      const calendar = this.props.calendar || this.ctx.calendar;
      let marginTop = this.style.marginTop + event.deltaY;
      let height = this.style.height - event.deltaY;
      if (direction === 'bottom') {
        marginTop = this.style.marginTop;
        height = this.style.height + event.deltaY;
      }

      const isOverDrag = (height <= this.cellHeight);
      if (isOverDrag) {
        let stickBorderTime = this.state.to;
        if (direction === 'bottom') {
          stickBorderTime = this.state.from;
        }
        this.setState({ 
          stickBorderTime 
        });
      } else {
        const newTime = new HourMinute(calendar.state.baselineClock);
        const newState = {
          style: { marginTop, height },
        };
        switch (direction) {
          case 'top': newState.from = newTime; break;
          case 'bottom': newState.to = newTime; break;
        }
        this.setState(newState);
      }
    });

    resizeHammer.on('panend', (event) => {
      const newCard = this.getNewCard((card) => {
        card.from = this.state.from;
        card.to = this.state.to;
        card.date = getDateBySplit(card.from, this.props.cardInfo.date);
      });
      this.setState({
        isMoving: false,
        isResizing: false
      });
      if (typeof this.props.onPanEnd === 'function') {
        this.props.onPanEnd(event, newCard);
      }
    });
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
    this.setState({ isPopUpActive: false });
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
      orders 
    } = this.props.cardInfo;
    const calendar = this.props.calendar;
    const duration = '' + moment(this.state.date).format('ddd') +
      ' ' + getFormatTime(this.state.from) + ' - ' + getFormatTime(this.state.to);
    const stats = _.groupBy(
      orders.map((order) => {
        order.status = 'paid';
        if (order.checkedInAt) {
          order.status = 'checkin';
        }
        if (order.cancelledAt) {
          order.status = 'cancel';
        }
        return order;
      }),
      'status'
    );

    let hideButton;
    let onClickThis = this.showPopUp.bind(this);
    let className = 'class-card';
    let style = Object.assign({}, 
      this.state.style, this.props.style);

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
      if (this.props.onHide) {
        onHide = (event) => {
          this.props.onHide.call(this, event, this.props.cardInfo);
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

    return (
      <div
        className={className}
        style={style}
        id={`class_${id}`}
        onMouseLeave={this.hidePopUp.bind(this)}
        onClick={onClickThis}
        onMouseDown={this.onMouseDown.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
        ref="card">
        <div className="class-name">{template.name}</div>
        {hideButton}
        {popupView}
      </div>
    );
  }
}

module.exports = ClassCard;
