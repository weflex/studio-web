"use strict";
import React from 'react';
import ReactDOM from 'react-dom';
import ClassCard from './card.jsx';
import Calendar from './calendar.jsx';
import { NewClassTemplate } from './new.jsx';
import { DropModal } from 'boron';
import {
  getWeek,
  getCellHeight,
  getFormatTime,
} from './util.js';

import '../layout/font.css';
import './index.css';

const client = require('@weflex/gian').getClient('dev');
const moment = require('moment');
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
    const classes = await client.class.list({
      include: ['trainer', 'template', 'orders']
    });
    classes.forEach((classInfo) => {
      this.state.allClass.set(classInfo.id, classInfo);
    });

    const schedule = this.getSchedule(classes);
    this.originalSchedule = schedule;
    this.setState({ schedule });
  }

  componentDidMount() {
    this.getClassData();
  }

  getSchedule(classes) {
    let schedule = new Map();
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
    return schedule;
  }

  getCardTemplate() {
    const updateCard = this.updateClasses.bind(this);
    const calendar = this.refs.calendar;

    return class CardTemplate extends React.Component {
      render() {
        const props = Object.assign({}, this.props);
        return (
          <ClassCard
            {...props}
            calendar={calendar}
            updateCard={updateCard}
          />
        );
      }
    }
  }

  setCreateClassTemplate(from, to, date) {
    const self = this;
    const handleCreateClass = this.handleCreateClass.bind(this);
    const newClassTemplate = class ClassTemplate extends React.Component {
      render() {
        const props = {from, to, date};
        return (
          <NewClassTemplate
            {...props}
            ref={(node) => {
              if (node) {
                self.newClassTemplate = node;
              }
            }}
            onCreateClass={handleCreateClass}
          />
        );
      }
    };
    this.setState({
      newClassTemplate
    });
  }

  handleCreateClass(newClass) {
    this.refs.newClassModal.hide();
    this.updateClasses(newClass);
    this.refs.calendar.cancelCreateCard();
  }

  onAddCard(from, to, date) {
    const fromString = getFormatTime(from);
    const toString = getFormatTime(to);

    this.setCreateClassTemplate(fromString, toString, date);
    this.refs.newClassModal.show();
  }

  updateClasses(newClass) {
    this.state.allClass.set(newClass.id, newClass);
    const schedule = this.getSchedule(this.state.allClass);
    this.setState({ schedule });
  }

  handleHideModal() {
    this.refs.calendar.cancelCreateCard();
    if (this.newClassTemplate) {
      this.newClassTemplate.setState({
        isModalShow: false
      });
    }
  }

  render() {
    const cellHeight = getCellHeight();
    return (
      <div>
        <Calendar
          ref="calendar"
          cellHeight={cellHeight}
          schedule={this.state.schedule}
          onAddCard={this.onAddCard.bind(this)}
          cardTemplate={this.getCardTemplate()}
        />
        <DropModal
          ref="newClassModal"
          contentStyle={{ padding: 10 }}
          onHide={this.handleHideModal.bind(this)}
        >
          {this.state.newClassTemplate ? <this.state.newClassTemplate /> : <div></div>}
        </DropModal>
      </div>
    );
  }
}

module.exports = WeflexCalendar;
