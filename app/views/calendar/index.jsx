"use strict";
import React from 'react';
import ReactDOM from 'react-dom';
import ClassCard from './card';
import Calendar from './calendar';
import { Resource } from './components/resource';
import { WeekPicker } from './components/week-picker';
import { NewClassTemplate } from './new';
import { DropModal } from 'boron';
import {
  getWeek,
  getCellHeight,
  getFormatTime,
} from './util.js';

import '../../layout/font.css';
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
    };
  }

  get title() {
    return (
      <WeekPicker calendar={this.refs.calendar} />
    );
  }

  get actions() {
    return [
      {
        title: '管理课程',
        onClick: () => {
          console.log('start to manage classes');
        }
      },
      {
        title: '添加课程',
        onClick: 'resource.show'
      }
    ];
  }

  get resource() {
    return <Resource calendar={this.refs.calendar} />;
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
    this.getCardTemplate();
  }

  componentWillUpdate(nextProps, nextState) {
    this.getCardTemplate();
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
    const ctx = {};
    ctx.calendar = this.refs.calendar;
    ctx.cards = [];
    ctx.calendar.ctx = ctx;

    this.cardTemplate =  class CardTemplate extends React.Component {
      componentDidMount() {
        this.refs.classCard.ctx = ctx;
        ctx.cards.push(this.refs.classCard);
      }

      render() {
        const props = Object.assign({}, this.props);
        return (
          <ClassCard
            {...props}
            ref="classCard"
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
      this.newClassTemplate.isModalShow = false;
    }
  }

  render() {
    const cellHeight = getCellHeight();
    if (this.state.newClassTemplate) {
      var classTempalte = <this.state.newClassTemplate />;
    } else {
      classTempalte = null;
    }

    return (
      <div>
        <Calendar
          ref="calendar"
          cellHeight={cellHeight}
          schedule={this.state.schedule}
          onAddCard={this.onAddCard.bind(this)}
          cardTemplate={this.cardTemplate}
        />
        <DropModal
          ref="newClassModal"
          contentStyle={{ padding: 10 }}
          onHide={this.handleHideModal.bind(this)}
        >
        {classTempalte}
        </DropModal>
      </div>
    );
  }
}

module.exports = WeflexCalendar;
