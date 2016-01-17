"use strict";

import React from 'react';
import './index.css'

const moment = require('moment');
const DAYHOUR = 24;
const WEEKDAY = 7;
moment.locale('zh-cn');

function getWeek(date, format) {
  var weekDate = {};
  weekDate.begin = getWeekBegin(date, format);
  weekDate.end = getWeekEnd(date, format);
  return weekDate;
}

function getWeekEnd(date, formatString) {
  return moment(date).endOf('week').format(formatString);
}

function getWeekBegin(date, formatString) {
  return moment(date).startOf('week').format(formatString);
}

function range(start, end) {
  if (!end) {
    end = start;
    start = 0;
  }
  let c = [];
  while (end > start) {
    c[start++] = start
  }
  return c;
}

function TableHeader(props) {
  let header = [];
  let date = props.currentDate;

  header.push(
    <li key="header-index" className="header-index">时间</li>
  );
  for (let i = 1; i <= WEEKDAY; i++) {
    let day = moment(date).days(i);
    let dayDate = day.format('MM/DD');
    let dayLocale = day.format('ddd');
    header.push(
      <li key={i}>{dayDate} {dayLocale}</li>
    );
  }
  return (
    <ul className="table-header">{header}</ul>
  );
}

function Cards(props) {
  return (
    <div className='cards'>
      {props.cardsInfo.map((card, index) => {
        return <props.cardTemplate key={index} {...card} />;
      })}
    </div>
  );
}

class ScheduleTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tableHeight: 0
    };
  }

  renderCards(cardsInfo, index) {
    return (
      <li key={index} style={{height: this.props.cellHeight}}>
        <Cards cardsInfo={cardsInfo} cardTemplate={this.props.cardTemplate} />
      </li>
    );
  }

  getCards(daySchedule, hourIndex) {
    let style = {height: this.props.cellHeight};
    if (daySchedule) {
      let cardsInfo = daySchedule.get(hourIndex);
      if (cardsInfo) {
        return this.renderCards(cardsInfo, hourIndex);
      }
    }
    return <li key={hourIndex} style={style}></li>
  }

  getHourAxis() {
    let style = {
      li: {
        height: this.props.cellHeight + 1,
        lineHeight: parseInt(this.props.cellHeight + 1) + 'px'
      },
      ul: {
        marginTop: DAYHOUR
      }
    }
    let col = range(DAYHOUR).map(function (value, index) {
      return <li key={index} style={style.li}>{ value === DAYHOUR ? '' : `${value}:00`}</li>
    });
    col.pop();
    // FIXME(Yorkie): key can't be covered in the same value
    return (
      <ul  key="hour-axis" className='hour-axis' style={style.ul}>
        {col}
      </ul>
    );
  }

  getTableColumn(weekSchedule, dayIndex) {
    var daySchedule = weekSchedule.get(dayIndex);
    return (
      <ul key={dayIndex}>
        {range(DAYHOUR).map((value, hourIndex) => {
          return this.getCards(daySchedule, hourIndex);
        })}
      </ul>
    );
  }

  getTableBody() {
    var tableBody = [];
    var hourAxis = this.getHourAxis();
    tableBody.push(hourAxis);
    for (let i = 1; i <= WEEKDAY; i++) {
      let col = this.getTableColumn(this.props.weekSchedule, i);
      tableBody.push(col);
    }
    return tableBody;
  }

  componentDidMount() {
    var table = this.refs.table.getBoundingClientRect();
    var tableHeight = window.innerHeight - table.top;
    this.setState({tableHeight: tableHeight});
  }

  render() {
    return (
      <div className="schedule-table" ref="table" style={{
        height: this.state.tableHeight
      }}>
        {this.getTableBody()}
      </div>
    );
  }
}

class WeekHeader extends React.Component {
  constructor(props) {
    super(props);
    this.setDate = props.setDate;
    this.currentDate = props.currentDate;
  }

  goPrevWeek() {
    this.setDate(moment(this.currentDate.subtract(7, 'days')));
  }

  goNextWeek() {
    this.setDate(moment(this.currentDate.add(7, 'days')));
  }

  render() {
    const weekDate = getWeek(this.props.currentDate, 'MM[月]DD[日]');
    return (
      <div className="week-header">
        <div className="selector">
          <span className="go-prev-btn"
            onClick={this.goPrevWeek.bind(this)}>{'<'}
          </span>
          <div className="week-date">{weekDate.begin} - {weekDate.end}</div>
          <span className="go-next-btn"
            onClick={this.goNextWeek.bind(this)}>{'>'}
          </span>
        </div>
        <TableHeader currentDate={this.props.currentDate} />
        <div className="scroll-div" style={{width: this.props.scrollBarWidth}}></div>
      </div>
    );
  }
}

class Calendar extends React.Component {
  constructor(props) {
    super(props);
    var currentDate         = moment();
    var weekDate            = getWeek(currentDate, 'YYYYMMDD');
    var currentWeekSchedule = props.schedule.get(`${weekDate.begin}-${weekDate.end}`) || new Map();

    this.state = {
      currentDate: currentDate,
      currentWeekSchedule: currentWeekSchedule,
    };
    this.scrollBarWidth = 15;
  }

  componentWillReceiveProps(nextProps) {
    let currentDate         = moment();
    let weekDate            = getWeek(currentDate, 'YYYYMMDD');
    let currentWeekSchedule = nextProps.schedule.get(`${weekDate.begin}-${weekDate.end}`) || new Map();
    this.setState({currentDate, currentWeekSchedule});
  }

  setCurrentDate(date) {
    let weekDate = getWeek(date, 'YYYYMMDD');
    let currentWeekSchedule = this.props.schedule.get(`${weekDate.begin}-${weekDate.end}`) || new Map();
    this.setState({currentDate: date, currentWeekSchedule});
  }

  render() {
    return (
      <div className="calendar">
        <WeekHeader
          currentDate={this.state.currentDate}
          setDate={this.setCurrentDate.bind(this)}
          scrollBarWidth={this.scrollBarWidth}/>
        <ScheduleTable
          weekSchedule={this.state.currentWeekSchedule}
          cardTemplate={this.props.cardTemplate}
          cellHeight={this.props.cellHeight || 40}
          containerHeight={this._calendarHeight}
          />
      </div>
    );
  }
};

exports.Calendar = Calendar;
exports.getWeek = getWeek;