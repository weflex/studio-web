import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import './index.css';
import {
  getWeek,
  getRange,
  getWeekEnd,
  getWeekBegin,
} from './util.js'

const DAYHOUR = 24;
const WEEKDAY = 7;
const BORDER_HEIGHt = 1;

moment.locale('zh-cn');

class TableHeader extends React.Component {
  render() {
    let header = [];
    let date = this.props.currentDate;

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
}

class Cards extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let cards = this.props.cardsInfo.map((card, index) => {
      return (
        <this.props.cardTemplate
          key={index}
          cardInfo={card}
          baselineClock={this.props.baselineClock}
        />
      );
    });

    return (
      <div
        className="cards"
        ref='cards'
        onClick={this.handleClick}>
        {cards}
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
    let weekDate = getWeek(this.props.currentDate, 'MM[月]DD[日]');

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
        <TableHeader currentDate={this.props.currentDate}/>
        <div className="scroll-div"></div>
      </div>
    );
  }
}

class Calendar extends React.Component {
  constructor(props) {
    super(props);
    const currentDate  = moment();
    const weekDate     = getWeek(currentDate, 'YYYYMMDD');
    const weekSchedule = props.schedule.get(`${weekDate.begin}-${weekDate.end}`) || new Map();

    this.table = {};
    this.cellList = [];
    this.colList = [];
    this.state = {
      currentDate,
      weekSchedule,
      tableHeight: 0,
      scrollTop : 0,
      baselineTop: 0,
      cellHeight: props.cellHeight || 40,
      baselineClock: {
        hour: 0,
        minute: 0,
      },
    };
  }

  renderCards(cardsInfo, index) {
    return (
      <li
        key={index}
        style={{height: this.state.cellHeight}}
        ref={c => {if (c) {this.cellList[index] = c.getBoundingClientRect()}}}>
        <Cards
          cardsInfo={cardsInfo} 
          cardTemplate={this.props.cardTemplate}
          baselineClock={this.state.baselineClock}
        />
      </li>
    );
  }

  getCards(daySchedule, hourIndex) {
    let style = {height: this.state.cellHeight};
    if (daySchedule) {
      let cardsInfo = daySchedule.get(hourIndex);
      if (cardsInfo) {
        return this.renderCards(cardsInfo, hourIndex);
      }
    }

    return (
      <li
        style={style}
        key={hourIndex}
        ref={c => {if (c) {this.cellList[hourIndex] = c.getBoundingClientRect()}}}>
      </li>
    );
  }

  getHourAxis() {
    let style = {
      li: {
        height: this.state.cellHeight + 1,
        lineHeight: parseInt(this.state.cellHeight + 1) + 'px'
      },
      ul: {
        marginTop: (this.state.cellHeight + 1) / 2
      }
    };

    let col = getRange(1, DAYHOUR - 1).map((value) => {
      if (value < 10) {
        value = '0' + value;
      }
      return <li key={value} style={style.li}>{`${value}:00`}</li>
    });

    return (
     <ul  key="hour-axis" className="hour-axis" style={style.ul}>
        {col}
      </ul>
    );
  }

  getTableColumn(weekSchedule, dayIndex) {
    let daySchedule = weekSchedule.get(dayIndex);
    let col = getRange(0, DAYHOUR - 1).map((value, hourIndex) => this.getCards(daySchedule, hourIndex));

    return (
      <ul key={dayIndex} ref={ul => {if (ul){this.colList[dayIndex] = ul.getBoundingClientRect()}}}>{col}</ul>
    );
  }

  getTableBody() {
    let tableBody = [];
    let hourAxis = this.getHourAxis();

    tableBody.push(hourAxis);

    for (let i = 1; i <= WEEKDAY; ++i) {
      let col = this.getTableColumn(this.state.weekSchedule, i);
      tableBody.push(col);
    }

    return tableBody;
  }

  setBaseline(e) {
    let baselineTop = e.clientY - this.table.top + this.state.scrollTop;
    let baselineLeft = e.clientX - this.table.left;

    this.setState({baselineTop});

    for (let index in this.cellList) {
      let cell = this.cellList[index];
      let top = cell.top - this.table.top + this.state.scrollTop;
      let bottom  = cell.bottom - this.table.top + this.state.scrollTop;
      if (top <= baselineTop && baselineTop <= bottom) {
        let offsetTop = baselineTop - top;
        let offsetBottom = bottom - baselineTop;
        let minute = Math.floor((offsetTop) / cell.height * 60);
        let hour = parseInt(index);
        if (minute === 60) {
          hour = hour + 1;
          minute = 0;
        }

        let baselineClock = {
          hour: hour,
          minute: minute
        };


        this.setState({baselineClock});
        break;
      }
    }

    for (let index in this.colList) {

    }
  }

  getBaseLine(time, top) {
    let {hour, minute} = time;
    let baselineHour = hour < 10 ? ('0' + hour) : hour;
    let baselineMin = minute  < 10 ? ('0' + minute) : minute;
    let style = {
      marginTop: top
    };

    if (top > 0) {
      return (
        <div className="baseline-wrap" >
          <div className="baseline-clock" style={style}>
            {baselineHour}:{baselineMin}
          </div>
          <div className="baseline" style={style}>
          </div>
        </div>

      );
    }
    return ;
  }

  handleScroll(e) {
    this.setState({
      scrollTop: e.target.scrollTop
    });
  }


  componentDidMount() {
    let table = this.refs.table.getBoundingClientRect();
    let tableHeight = window.innerHeight - table.top;
    this.table = table;
    this.setState({tableHeight});
  }

  render() {
    let tableBody = this.getTableBody();
    let baseline = this.getBaseLine(this.state.baselineClock, this.state.baselineTop);
    return (
      <div
        ref="table"
        className="schedule-table"
        style={{height: this.state.tableHeight}}
        onMouseMove={this.setBaseline.bind(this)}
        onScroll={this.handleScroll.bind(this)}>
        {tableBody}
        {baseline}
      </div>
    );
  }

  componentWillReceiveProps(nextProps) {
    const currentDate  = moment();
    const weekDate     = getWeek(currentDate, 'YYYYMMDD');
    const weekSchedule = nextProps.schedule.get(`${weekDate.begin}-${weekDate.end}`) || new Map();

    const state = {currentDate, weekSchedule};

    this.setState(state);
  }

  setCurrentDate(currentDate) {
    let weekDate = getWeek(date, 'YYYYMMDD');
    let weekSchedule = this.props.schedule.get(`${weekDate.begin}-${weekDate.end}`) || new Map();
    this.setState({currentDate, weekSchedule});
  }

  render() {

    let tableBody = this.getTableBody();
    let baseline = this.getBaseLine(this.state.baselineClock, this.state.baselineTop);

    return (
      <div className="calendar">
        <WeekHeader
          currentDate={this.state.currentDate}
          setDate={this.setCurrentDate.bind(this)}
        />
        <div
          ref="table"
          className="schedule-table"
          style={{height: this.state.tableHeight}}
          onMouseMove={this.setBaseline.bind(this)}
          onScroll={this.handleScroll.bind(this)}>
          {tableBody}
          {baseline}
        </div>
      </div>
    );
  }
};


export {
  getWeek,
  Calendar
};
