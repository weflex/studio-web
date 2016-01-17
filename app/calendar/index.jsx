"use strict";

import React from 'react';
import ClassCard from './card';
import {
  Calendar,
  getWeek
} from './calendar';

const client = require('@weflex/gian').getClient();
const moment = require('moment');
const CELL_HEIGHT = 50;

class WeflexCalendar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      schedule: new Map(),
    };
  }
  get title() {
    return '课程日历';
  }
  async getClassData() {
    const schedule = new Map();
    const classes = await client.class.list({
      include: {
        'template': 'trainer'
      }
    });
    classes.forEach(function (classInfo) {
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
    console.log(schedule);
    this.setState({schedule: schedule});
  }

  componentDidMount() {
    this.getClassData();
  }

  render() {
    return (
      <Calendar
        schedule={this.state.schedule}
        cardTemplate={ClassCard}
        cellHeight={CELL_HEIGHT}
        schedule={this.state.schedule}/>
    );
  }
}

module.exports = WeflexCalendar;
