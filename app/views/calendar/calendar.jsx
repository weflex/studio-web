"use strict";

import React from 'react';
import ReactDOM from 'react-dom';
import Hammer from 'hammerjs';
import moment from 'moment';
import {
  getRoundTime,
  getFormatTime,
  getGridHeight,
  getTimeDuration,
  getGridOffsetByTime,
} from './util.js';

import { range } from 'lodash';
import { CCViewMode } from './calendar-controller';

const DAYHOUR = 24;
const WEEKDAY = 7;
const BORDER_HEIGHt = 1;
moment.locale('zh-cn');

class TableHeader extends React.Component {
  constructor(props) {
    super(props);
    this.dayList = [];
  }

  render() {
    const date = moment(this.props.viewDate).startOf('week');
    const style = {
      width: `calc((100% - 60px) / ${this.props.indexes.length} - 1px)`
    }
    return (
      <ul className="table-header" ref="table-header">
        <li key="header-index" className="header-index"></li>
          {
            this.props.indexes.map(({raw, content}, i) => {
              return (
                <li key={i} style={style} ref={(c)=> {this.dayList[i] = raw}}>
                  {content}
                </li>
              );
            })
          }
      </ul>
    );
  }
}

class Cards extends React.Component {
  render() {
    let zIndex = this.props.hour + 10;
    const total = this.props.cardsInfo.length;
    return (
      <div
        ref="cards"
        className="cards"
        style={{zIndex}}
        onClick={this.handleClick}>
        {this.props.cardsInfo.map((card, index) => {
          return (
            <this.props.cardTemplate key={index} cardInfo={card} total={total} moveDisabled={true}/>
          );
        })}
      </div>
    );
  }
}

class Calendar extends React.Component {
  constructor(props) {
    super(props);
    const viewDate     = moment();
    const currentDate  = moment();
    const weekSchedule = props.schedule.filterByWeek(viewDate);
    const startOfWeek = moment(this._viewDate).startOf('week');
    const week = range(0, 7).map((n) => moment(startOfWeek).add(n, 'days'));
    const indexes = week.map((d) => {
      return {
        raw: d,
        content: d.format('ddd DD')
      };
    });

    this.table = {};
    this.rowList = [];
    this.colList = [];
    this.state = {
      viewDate,
      viewMode: CCViewMode.week,
      currentDate,
      weekSchedule,
      indexes,
      tableHeight: 0,
      scrollTop : 0,
      baselineTop: 0,
      baselineClock: {
        hour: 0,
        minute: 0,
      },
      createCardStyle: {
        top: 0,
        left: 0,
        height: 0,
        width: 0,
      },
      isEditing: false,
    };
    this.createCardTop = 0;
    this.interval = 0;
  }

  getHourAxis() {
    let style = {
      li: {
        height: this.props.cellHeight + 1,
        lineHeight: parseInt(this.props.cellHeight + 1) + 'px'
      },
      ul: {
        marginTop: (this.props.cellHeight + 1) / 2
      }
    };
    return (
      <ul key="hour-axis" className="hour-axis" style={style.ul}>
        {
          range(1, DAYHOUR).map((hour, index) => {
            const formatedSting = getFormatTime({hour, minute: 0});
            return <li key={index} style={style.li}>{formatedSting}</li>
          })
        }
      </ul>
    );
  }

  setViewDate(viewDate) {
    const weekSchedule = this.props.schedule.filterByWeek(viewDate);
    this.setState({ weekSchedule, viewDate });
  }

  setViewMode(viewMode) {
    this.setState({ viewMode });
  }

  getTableColumn(index, i) {
    const style = {
      ul: {
        width: `calc((100% - 60px) / ${this.state.indexes.length} - 1px)`
      },
      li: {
        height: this.props.cellHeight,
      }
    };
    const { weekSchedule, viewDate } = this.state;
    let day;
    let schedule;
    if (CCViewMode.day === this.state.viewMode) {
      day = moment(this.state.viewDate);
      const trainer = index.raw;
      schedule = this.state.weekSchedule.filterByTrainer(trainer);
    } else {
      day = index.raw;
      schedule = this.state.weekSchedule.filterByDay(day);
    }

    return (
      <ul
        className="schedule-table-column"
        key={i}
        style={style.ul}
        ref={
          (ul) => {
            if (ul) {
              this.colList[i+1] = ul.getBoundingClientRect();
            }
          }
        }>
        {
          range(0, DAYHOUR).map((hourIndex) => {
            const hour = moment(day).add(hourIndex, 'hours');
            const cardsInfo = schedule.filterByHour(hour).get();
            return (
              <li style={style.li}
                  key={hourIndex}
                  ref={
                    (c) => {
                      if (c) {
                        this.rowList[hourIndex] = c.getBoundingClientRect();
                      }
                    }
                  }>
                <Cards hour={hourIndex}
                       day={i}
                       cardsInfo={cardsInfo}
                       cardTemplate={this.props.cardTemplate} />
              </li>
            );
          })
        }
      </ul>
    );
  }

  setBaseline(e) {
    let clientX, clientY;
    if (window.TouchEvent && e instanceof window.TouchEvent) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    let baselineTop = clientY - this.table.top + this.state.scrollTop;
    let baselineLeft = clientX;
    this.setState({ baselineTop });

    this.rowList.forEach((row, index) => {
      let top = row.top - this.table.top + this.state.scrollTop;
      let bottom  = row.bottom - this.table.top + this.state.scrollTop;
      if (top <= baselineTop && baselineTop <= bottom) {
        let offsetTop = baselineTop - top;
        let offsetBottom = bottom - baselineTop;
        let minute = Math.floor((offsetTop) / row.height * 60);
        let hour = index;
        if (minute === 60) {
          hour = hour + 1;
          minute = 0;
        }

        let baselineClock = {
          hour: hour,
          minute: minute
        };

        this.setState({
          baselineClock,
          atRow: index
        });
      }
    });

    let currColIndex = -1;
    this.colList.forEach((col, index) => {
      if (baselineLeft > col.left && baselineLeft < col.right) {
        currColIndex = index;
      }
    });
    // Correct the value if it's out of the colList range
    if (currColIndex === -1) {
      if (baselineLeft > this.colList[this.colList.length - 1].right) {
        currColIndex = this.colList.length - 1;
      } else if (baselineLeft < this.colList[0].left) {
        currColIndex = 1;
      }
    }
    this.setState({
      atCol: currColIndex
    });
  }

  getBaseLine(time, top) {
    const style = {
      marginTop: top
    };
    const timeString = getFormatTime(time);
    if (top > 0) {
      return (
        <div className="baseline-wrap">
          <div className="baseline hidden" style={style}></div>
        </div>
      );
    }
    return;
  }

  /**
   * Current Line is for showing what's the time now
   */
  getCurrentLine() {
    const viewDate = this.state.viewDate;
    const currentDate = this.state.currentDate;
    if (!this.rowList.length) {
      return null;
    }
    // if the viewDate is after the end day of this week or before the start day of week
    // should not show current line
    if (viewDate.isAfter(moment().endOf('week')) || viewDate.isBefore(moment().startOf('week'))) {
      return null;
    }
    const time = {
      hour: currentDate.hours(),
      minute: currentDate.minutes()
    };
    const style = {
      marginTop: 0
    };
    // just pick the first item's height
    const rowHeight = this.rowList[0].height;
    style.marginTop = time.hour * rowHeight + (time.minute / 60) * rowHeight;
    return (
      <div className="baseline-wrap">
        <div className="baseline-clock" style={style}>
          <span className="baseline-clock-base">
            {getFormatTime(time)}
          </span>
          <span className="baseline-clock-triangle"></span>
        </div>
        <div className="baseline" style={style}></div>
      </div>
    );
  }

  handleScroll(e) {
    if (e.target.scrollTop >= 0) {
      this.setState({
        scrollTop: e.target.scrollTop
      });
    }
  }

  cancelCreateCard() {
    const createCardStyle = Object.assign({}, this.state.createCardStyle);
    createCardStyle.top = -20;
    createCardStyle.opacity = 0;
    this.setState({ createCardStyle });
  }

  getCreateCard() {
    return (
      <div
        ref="createCard"
        className="create-card create-card-shown"
        style={this.state.createCardStyle}>
      </div>
    );
  }

  createCard() {
    const hammer = new Hammer(this.refs.table);

    hammer.get('pan').set({
      direction: Hammer.DIRECTION_VERTICAL,
      threshold: 0
    });

    hammer.on('singletap', (event) => {
      const createCardStyle = {
        height: 0,
        width: 0,
        top: 0,
      };

      this.setState({ createCardStyle });
    });

    // Hammerjs will trigger both handler while elements are overlap
    // and listen same event, so need to judge cards is dragging.
    let isCardsDragging = false;
    hammer.on('panstart', (event) => {
      if (this.ctx && Array.isArray(this.ctx.cards)) {
        isCardsDragging = this.ctx.cards.some((card) => {
          return card.isCardDragging();
        });
        if (!isCardsDragging) {
          const col = this.colList[this.state.atCol];
          const row = this.rowList[this.state.atRow];
          const left = col.left - this.table.left;
          const width = col.right - col.left;
          const selectBeginTime = this.state.baselineClock;
          const top = this.state.baselineTop - this.state.scrollTop;
          this.createCardTop = top;
          const createCardStyle = {
            top,
            left,
            width,
            opacity: 1
          };
          this.setState({ createCardStyle, selectBeginTime });
        }
      }
    });

    hammer.on('pandown', (event) => {
      if (event.deltaY > 0 && !isCardsDragging) {
        const height = event.deltaY;
        const createCardStyle = Object.assign({}, this.state.createCardStyle);
        createCardStyle.top = this.createCardTop + this.state.scrollTop;
        createCardStyle.height = height;

        this.setState({ createCardStyle });
      }
    });

    hammer.on('panend', (event) => {
      if (!isCardsDragging &&
          this.state.selectBeginTime &&
          this.state.createCardStyle.height) {

        const newFromHour = getRoundTime(this.state.selectBeginTime);
        const newToHour = getRoundTime(this.state.baselineClock);
        const rowIndex = newFromHour.hour;
        const row = this.rowList[rowIndex];
        const top = row.top - this.table.top + this.state.scrollTop;
        const marginTop = getGridOffsetByTime(newFromHour, this.props.cellHeight);
        const height = getGridHeight(newFromHour, newToHour, this.props.cellHeight);
        const createCardStyle = Object.assign({}, this.state.createCardStyle);
        createCardStyle.height = height;
        createCardStyle.top = top;
        createCardStyle.marginTop = marginTop;

        isCardsDragging = false;
        this.setState({ createCardStyle });

        const duration = getTimeDuration(newFromHour, newToHour);
        if (duration) {
          if (CCViewMode.week === this.state.viewMode) {
            const date = this.refs.tableHeader.dayList[this.state.atCol].format('YYYY-MM-DD');
            this.props.onAddCard(newFromHour, newToHour, date);
          } else {
            const date = this.state.viewMode;
            const { trainerId } = this.refs.tableHeader.dayList[this.state.atCol];
            this.props.onAddCard(newFromHour, newToHour, date, trainerId);
          }
        }
      }
    });
  }

  setTableHeight() {
    this.table = this.refs.table.getBoundingClientRect();
    const tableHeight = window.innerHeight - this.table.top;
    this.setState({ tableHeight });
  }

  setScrollTop() {
    const hour = this.state.viewDate.hours();
    if (this.rowList.length > 0) {
      let rowHeight = this.rowList[0].height;
      // FIXME(Yorkie): 15px will let user see the complete top time string.
      let scrollTop = (hour - 2) * rowHeight - 15;
      if (scrollTop > 0) {
        this.setState({ scrollTop });
        this.refs.table.scrollTop = scrollTop;
      }
    }
  }

  componentDidMount() {
    this.createCard();
    this.setTableHeight();
    this.setScrollTop();
    window.onresize = () => {
      this.setTableHeight();
    };
    this.interval = setInterval(() => {
      this.setState({
        currentDate: moment()
      });
    }, 30000);
  }

  componentWillUnmount() {
    window.onresize = null;
    clearInterval(this.interval);
  }

  componentWillReceiveProps(nextProps) {
    const weekSchedule = nextProps.schedule.filterByWeek(this.state.viewDate);
    this.setState({ weekSchedule });
  }

  render() {
    const baseline = this.getBaseLine(this.state.baselineClock, this.state.baselineTop);
    const currline = this.getCurrentLine();
    const createCard = this.getCreateCard();
    return (
      <div className="calendar" ref="calendar">
        <div className="week-header">
          <TableHeader viewDate={this.state.viewDate} indexes={this.state.indexes} ref="tableHeader" />
          <div className="scroll-div"></div>
        </div>
        <div
          ref="table"
          className="schedule-table"
          style={{height: this.state.tableHeight}}
          onMouseMove={this.setBaseline.bind(this)}
          onScroll={this.handleScroll.bind(this)}>
          {
            [
              this.getHourAxis(),
              this.state.indexes.map((d, i) => this.getTableColumn(d, i))
            ]
          }
          {baseline}
          {currline}
          {createCard}
        </div>
      </div>
    );
  }
};

Calendar.propTypes = {
  schedule: React.PropTypes.object,
  cellHeight: React.PropTypes.number,
  onAddCard: React.PropTypes.func,
};

module.exports = Calendar;
