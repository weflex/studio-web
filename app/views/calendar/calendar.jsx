import React from 'react';
import ReactDOM from 'react-dom';
import Hammer from 'hammerjs';
import moment from 'moment';
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
    let date = moment(this.props.viewDate).startOf('week');

    header.push(
      <li key="header-index" className="header-index"></li>
    );

    for (let i = 1; i <= WEEKDAY; i++) {
      let day = moment(date).days(i);
      let dayDate = day.format('DD');
      let dayLocale = day.format('ddd');

      header.push(
        <li key={i} ref={(c)=> {this.dayList[i] = day}}>
          {dayLocale} {dayDate}
        </li>
      );
    }

    return (
      <ul className="table-header" ref="table-header">{header}</ul>
    );
  }
}

class Cards extends React.Component {
  render() {
    let zIndex = 0;
    if (this.props.day) {
      zIndex = (7 - this.props.day) * 24;
    }
    if (this.props.hour) {
      zIndex = zIndex + (24 - this.props.hour);
    }
    return (
      <div
        ref="cards"
        className="cards"
        style={{zIndex}}
        onClick={this.handleClick}>
        {this.props.cardsInfo.map((card, index) => {
          return (
            <this.props.cardTemplate key={index} cardInfo={card} />
          );
        })}
      </div>
    );
  }
}

class Calendar extends React.Component {
  constructor(props) {
    super(props);
    const viewDate  = moment();
    const currentDate  = moment();
    const weekDate     = getWeek(viewDate, 'YYYYMMDD');
    const weekIndex    = `${weekDate.begin}-${weekDate.end}`;
    const weekSchedule = props.schedule.get(weekIndex) || new Map();

    this.table = {};
    this.rowList = [];
    this.colList = [];
    this.state = {
      viewDate,
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
      },
      isEditing: false,
    };
    this.createCardTop = 0;
  }

  renderCards(cardsInfo, hourIndex, dayIndex) {
    let refRow = c => {
      if (c) {
        this.rowList[hourIndex] = c.getBoundingClientRect();
      }
    };
    return (
      <li
        key={dayIndex + '_' + hourIndex}
        style={{height: this.state.cellHeight}}
        ref={refRow}>
        <Cards
          hour={hourIndex}
          day={dayIndex}
          cardsInfo={cardsInfo}
          cardTemplate={this.props.cardTemplate}
        />
      </li>
    );
  }

  getCards(daySchedule, hourIndex, dayIndex) {
    let style = {height: this.state.cellHeight};
    if (daySchedule) {
      let cardsInfo = daySchedule.get(hourIndex);
      if (cardsInfo) {
        return this.renderCards(cardsInfo, hourIndex, dayIndex);
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
      return this.getCards(daySchedule, hourIndex, dayIndex);
    });

    return (
      <ul
        className="schedule-table-column"
        key={dayIndex}
        ref={ul => {
          if (ul) {
            this.colList[dayIndex] = ul.getBoundingClientRect();
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
    let clientX, clientY;
    if (e instanceof TouchEvent) {
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
        const marginTop = getGridOffsetByTime(newFromHour, this.state.cellHeight);
        const height = getGridHeight(newFromHour, newToHour, this.state.cellHeight);
        const createCardStyle = Object.assign({}, this.state.createCardStyle);
        createCardStyle.height = height;
        createCardStyle.top = top;
        createCardStyle.marginTop = marginTop;

        isCardsDragging = false;
        this.setState({ createCardStyle });

        const duration = getTimeDuration(newFromHour, newToHour);
        if (duration) {
          const date = this.refs.tableHeader.dayList[this.state.atCol].format('YYYY-MM-DD');
          this.props.onAddCard(newFromHour, newToHour, date);
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
    const viewDate  = this.state.viewDate;
    const weekDate     = getWeek(viewDate, 'YYYYMMDD');
    const weekSchedule = nextProps.schedule.get(`${weekDate.begin}-${weekDate.end}`) || new Map();
    const state = {viewDate, weekSchedule};

    this.setState(state);
  }

  setViewDate(viewDate) {
    const weekDate = getWeek(viewDate, 'YYYYMMDD');
    const weekSchedule = this.props.schedule.get(`${weekDate.begin}-${weekDate.end}`) || new Map();
    this.setState({ viewDate, weekSchedule });
  }

  render() {
    const tableBody = this.getTableBody();
    const baseline = this.getBaseLine(this.state.baselineClock, this.state.baselineTop);
    const currline = this.getCurrentLine();
    const createCard = this.getCreateCard();
    return (
      <div className="calendar" ref="calendar">
        <div className="week-header">
          <TableHeader viewDate={this.state.viewDate} ref="tableHeader" />
          <div className="scroll-div"></div>
        </div>
        <div
          ref="table"
          className="schedule-table"
          style={{height: this.state.tableHeight}}
          onMouseMove={this.setBaseline.bind(this)}
          onScroll={this.handleScroll.bind(this)}>
          {tableBody}
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
