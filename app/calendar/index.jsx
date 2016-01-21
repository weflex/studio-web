require('babel-polyfill');
import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom'
import ClassCard from './card.jsx'
import {getCellHeight} from './util.js';
import {Calendar, getWeek} from './calendar.jsx'
const classes = require('json!./classes.json');

moment.locale('zh-cn');

class WeflexCalendar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      schedule: new Map(),
      allClass: new Map(),
    }
  }

  async getClassData() {

    classes.forEach((classInfo) => {
      this.state.allClass.set(classInfo.id, classInfo);
    });

    this.getSchedule();
  }

  componentDidMount() {
    this.getClassData();
  }

  getSchedule() {
    let schedule = new Map();
    this.state.allClass.forEach(function (classInfo) {
      let date = moment(classInfo.date);
      let week = getWeek(date, 'YYYYMMDD');
      let weekIndex = `${week.begin}-${week.end}`;
      let dayIndex = moment(classInfo.date).isoWeekday();
      let hourIndex = classInfo.from.hour;
      let weekSchedule, daySchedule, hourSchedule;

      weekSchedule = schedule.get(weekIndex);
      if (weekSchedule) {
        daySchedule = weekSchedule.get(dayIndex);
        if (daySchedule) {
          hourSchedule = daySchedule.get(hourIndex);
          if (hourSchedule) {
            hourSchedule.push(classInfo);
          } else {
            daySchedule.set(hourIndex, [classInfo]);
          }
        } else {
          daySchedule = new Map();
          daySchedule.set(hourIndex, [classInfo]);
          weekSchedule.set(dayIndex, daySchedule);
        }
      } else {
        weekSchedule = new Map();
        daySchedule = new Map();
        hourSchedule = [classInfo];
        daySchedule.set(hourIndex, hourSchedule);
        weekSchedule.set(dayIndex, daySchedule);
        schedule.set(weekIndex, weekSchedule);
      }
    });
    this.setState({schedule: schedule});
  }

  getCardTemplate() {
    let updateCard = this.updateSchedule.bind(this);
    let calendar = this.refs.calendar;
    return class CardTemplate extends React.Component {
      render() {
        const props = Object.assign({}, this.props);
        return (
          <ClassCard {...props} updateCard={updateCard} calendar={calendar}/>
        );
      }
    }
  }

  updateSchedule(newCard) {
    this.state.allClass.set(newCard.id, newCard);
    this.getSchedule();
  }

  render() {
    const cellHeight = getCellHeight();
    return (
      <Calendar
        ref="calendar"
        cellHeight={cellHeight}
        schedule={this.state.schedule}
        cardTemplate={this.getCardTemplate()}
      />
    );
  }
}

module.exports = WeflexCalendar;
