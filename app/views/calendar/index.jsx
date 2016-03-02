"use strict";
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import ClassCard from './card';
import Calendar from './calendar';
import { WeekPicker } from './components/week-picker';
import { NewClassTemplate } from './new';
import { DropModal } from 'boron';
import {
  getWeek,
  getCellHeight,
  getFormatTime,
} from './util.js';

import './index.css';

const Template = require('./components/template');
const ResourcePanel = require('../../components/resource-panel');
const client = require('@weflex/gian').getClient('dev');
const moment = require('moment');
moment.locale('zh-cn');

class WeflexCalendar extends React.Component {
  constructor(props) {
    super(props);
    this.cards = [];
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
        toggledTitle: '完成',
        onClick: (ctx, action) => {
          // hide the resource firstly.
          ctx.resource.hide();
          // FIXME(Yorkie): move the below code to calendar?
          const calendar = this.refs.calendar;
          const isEditing = !calendar.state.isEditing;
          calendar.setState({isEditing});
        }
      },
      {
        title: '添加课程',
        onClick: (ctx) => {
          const calendar = this.refs.calendar;
          calendar.setState({isEditing: false});
          ctx.resource.toggle();
        }
      }
    ];
  }

  get resource() {
    const actions = [
      {
        title: '添加模板',
        path: '/class/template/add'
      },
      {
        title: '管理模板',
        path: '/class/template'
      }
    ];
    const getData = async () => {
      return await client.classTemplate.list({
        include: 'trainer',
        where: {
          venueId: (await client.org.getSelectedVenue()).id
        }
      });
    };

    return (
      <ResourcePanel component={Template} 
        context={{
          actions,
          calendar: this.refs.calendar,
          onRelease: this.updateClasses.bind(this)
        }}
        getData={getData}
      />
    );
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
    let self = this;
    let ctx = {
      cards: [],
      calendar: self.refs.calendar
    };
    ctx.calendar.ctx = ctx;
    
    const updateClasses = self.updateClasses.bind(self);
    const deleteClassById = self.deleteClassById.bind(self);

    self.cardTemplate = class CardTemplate extends React.Component {
      componentDidMount() {
        this.refs.classCard.ctx = ctx;
        // push card to self.cards
        self.cards.push(this.refs.classCard);
        // reference self.cards to ctx.cards
        ctx.cards = self.cards;
      }
      render() {
        const props = Object.assign({}, this.props);
        return (
          <ClassCard
            {...props}
            ref="classCard"
            calendar={self.refs.calendar}
            onHide={(event, id) => {
              deleteClassById(id);
            }}
            onPanEnd={(event, data) => {
              updateClasses(data);
            }}
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

  async updateClasses(newClass) {
    // upsert the class to remote server
    // NOTE(Yorkie): DONT REMOVE THE CLONE, BECAUSE
    // GIAN WILL REMOVE `.id` that will change the id.
    const res = await client.class.upsert(newClass);
    newClass.id = res.id;
    this.state.allClass.set(newClass.id, newClass);

    // compute the schedule object out from classes.
    const schedule = this.getSchedule(this.state.allClass);
    this.setState({ schedule });
  }

  async deleteClassById(id) {
    // delete async
    client.class.delete(id);
    // delete in UI
    this.state.allClass.delete(id);

    // compute the schedule object out from classes.
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
          modalStyle={{width: 700}}
          contentStyle={{padding: 10}}
          onHide={this.handleHideModal.bind(this)}
        >
        {classTempalte}
        </DropModal>
      </div>
    );
  }
}

module.exports = WeflexCalendar;
