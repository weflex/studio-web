import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import Hammer from 'hammerjs';
import {
  getWeek,
  getRange,
  getWeekEnd,
  getWeekBegin,
  getRoundTime,
  getFormatTime,
  getGridHeight,
  getTimeDuration,
  getGridOffsetByTime,
} from './util.js'

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
        <li key={i} ref={(c)=> {this.dayList[i] = day}}>{dayDate} {dayLocale}</li>
      );
     }

    return (
      <ul className="table-header" ref="table-header">{header}</ul>
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
          <span className="go-prev-btn icon-font icon-left-open"
            onClick={this.goPrevWeek.bind(this)}>
          </span>
          <div className="week-date">{weekDate.begin} - {weekDate.end}</div>
          <span className="go-next-btn icon-font icon-right-open"
            onClick={this.goNextWeek.bind(this)}>
          </span>
        </div>
        <TableHeader currentDate={this.props.currentDate} ref="tableHeader" />
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
    const weekIndex    = `${weekDate.begin}-${weekDate.end}`;
    const weekSchedule = props.schedule.get(weekIndex) || new Map();

    this.table = {};
    this.rowList = [];
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
      createCardStyle: {
        top: 0,
        left: 0,
        height: 0,
        width: 0,
      }
    };
  }

  renderCards(cardsInfo, index) {
    return (
      <li
        key={index}
        style={{height: this.state.cellHeight}}
        ref={c => {if (c) {this.rowList[index] = c.getBoundingClientRect()}}}>
        <Cards
          cardsInfo={cardsInfo} 
          cardTemplate={this.props.cardTemplate}
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
        ref={c => {if (c) {this.rowList[hourIndex] = c.getBoundingClientRect()}}}>
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
      <ul key="hour-axis" className="hour-axis" style={style.ul}>
        {col}
      </ul>
    );
  }

  getTableColumn(weekSchedule, dayIndex) {
    let daySchedule = weekSchedule.get(dayIndex);
    let col = getRange(0, DAYHOUR - 1).map((value, hourIndex) => {
      return this.getCards(daySchedule, hourIndex);
    });

    return (
      <ul 
        key={dayIndex} 
        ref={ul => {
          if (ul) {
            this.colList[dayIndex] = ul.getBoundingClientRect()
        }}}>
        {col}
      </ul>
    );
  }

  getTableBody() {
    let hourAxis = this.getHourAxis();
    let tableBody = [hourAxis];

    for (let i = 1; i <= WEEKDAY; ++i) {
      let col = this.getTableColumn(this.state.weekSchedule, i);
      tableBody[i] = col;
    }

    return tableBody;
  }

  setBaseline(e) {
    let baselineTop = e.clientY - this.table.top + this.state.scrollTop;
    let baselineLeft = e.clientX - this.table.left;
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

    this.colList.forEach((col, index) => {
      if (col.left < baselineLeft && baselineLeft < col.right) {
        this.setState({
          atCol: index + 1,
        });
      }
    });
  }

  getBaseLine(time, top) {
    const style = {
      marginTop: top
    };
    const timeString = getFormatTime(time);

    if (top > 0) {
      return (
        <div className="baseline-wrap" >
          <div className="baseline-clock" style={style}>
            {timeString}
          </div>
          <div className="baseline" style={style}>
          </div>
        </div>
      );
    }
    return ;
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
    const hammer = new Hammer.Manager(this.refs.table);
    hammer.add(new Hammer.Pan());
    hammer.add(new Hammer.Tap({event: 'singletap'}));

    hammer.get('pan').set({
      direction: Hammer.DIRECTION_VERTICAL,
      threshold: 0
    });

    hammer.on('singletap', (event) => {
      const createCardStyle = {
        height: 0,
        width: 0
      };

      this.setState({ createCardStyle });
    })


    hammer.on('panstart', (event) => {
      if (this.state.isDragCard) {
        return;
      }

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
    });

    hammer.on('panup pandown', (event) => {
      if (this.state.isDragCard) {
        return;
      }
      if (event.deltaY > 0) {
        const height = event.deltaY;
        const createCardStyle = Object.assign({}, this.state.createCardStyle);
        createCardStyle.top = this.createCardTop + this.state.scrollTop;
        createCardStyle.height = height;

        this.setState({ createCardStyle });
      }
    });

    hammer.on('panend', (event) => {
      if (this.state.isDragCard) {
        return;
      }
      if (this.state.createCardStyle.height) {
        const newFromHour = getRoundTime(this.state.selectBeginTime);
        const newToHour = getRoundTime(this.state.baselineClock);
        const rowIndex = newFromHour.hour;
        const row = this.rowList[rowIndex];
        const top = row.top - this.table.top + this.state.scrollTop;
        const marginTop = getGridOffsetByTime(newFromHour, this.state.cellHeight);
        const height = getGridHeight(newFromHour, newToHour, this.state.cellHeight);
        const createCardStyle = Object.assign({}, this.state.createCardStyle);
        createCardStyle.height = height;
        createCardStyle.top = top;
        createCardStyle.marginTop = marginTop;

        this.setState({ createCardStyle });

        const duration = getTimeDuration(newFromHour, newToHour);
        if (duration) {
          const date = this.refs.weekHeader
                         .refs.tableHeader
                         .dayList[this.state.atCol]
                         .format('YYYY-MM-DD');

          this.props.onAddCard(newFromHour, newToHour, date);
        }
      }
    });
  }

  componentDidMount() {
    const table = this.refs.table.getBoundingClientRect();
    const tableHeight = window.innerHeight - table.top;
    this.table = table;
    this.createCard();
    this.setState({ tableHeight });
  }

  componentWillReceiveProps(nextProps) {
    const currentDate  = moment();
    const weekDate     = getWeek(currentDate, 'YYYYMMDD');
    const weekSchedule = nextProps.schedule.get(`${weekDate.begin}-${weekDate.end}`) || new Map();
    const state = {currentDate, weekSchedule};

    this.setState(state);
  }

  setCurrentDate(currentDate) {
    const weekDate = getWeek(currentDate, 'YYYYMMDD');
    const weekSchedule = this.props.schedule.get(`${weekDate.begin}-${weekDate.end}`) || new Map();
    this.setState({ currentDate, weekSchedule });
  }

  render() {
    const tableBody = this.getTableBody();
    const baseline = this.getBaseLine(this.state.baselineClock, this.state.baselineTop);
    const createCard = this.getCreateCard();

    return (
      <div className="calendar" ref="calendar">
        <WeekHeader
          ref="weekHeader"
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
}

module.exports = Calendar;
