"use strict";

import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import ClassCard from './card';
import ClassOverview from './class-overview';
import Calendar from './calendar';
import { SearchInput } from '../../components/toolbar/components/search';
import { WeekPicker } from './components/week-picker';
import { NewClassTemplate } from './new';
import {
  getWeek,
  getCellHeight,
  getFormatTime,
} from './util.js';
import UIFramework from 'weflex-ui';
import { client } from '../../api';
import './index.css';

const Template = require('./components/template');
const ResourcePanel = require('../../components/resource-panel');
const moment = require('moment');
moment.locale('zh-cn');

class WeflexCalendar extends React.Component {
  
  constructor(props) {
    super(props);
    this.cards = [];
    this.state = {
      schedule: new Map(),
      allClass: new Map(),
      modalVisibled: false,
    };
    SearchInput.Listen('onChange', this.onSearchInputChange.bind(this));
  }

  onSearchInputChange(text) {
    let results;
    if (text === '') {
      results = this.state.allClass;
    } else {
      results = new Map();
      this.state.allClass.forEach((item) => {
        if (item.template.name.indexOf(text) !== -1) {
          results.set(item.id, item);
        }
      });
    }
    const schedule = this.getSchedule(results);
    this.setState({ schedule });
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
          venueId: (await client.user.getVenueById()).id
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
    const venue = await client.user.getVenueById();
    const classes = (await client.class.list({
      // TODO(Yorkie): will use view
      include: [
        'trainer', 
        'template',
        {
          'orders': ['user', 'history']
        },
      ]
    })).filter((item) => {
      return item.template &&
        item.template.venueId === venue.id;
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
        const onHide = (event, data) => {
          if (!data || !data.id) {
            return alert('未知错误');
          }
          UIFramework.Modal.confirm({
            title: `你确认要删除课程“${data.template.name}”？`,
            content: `你确认要删除课程“${data.template.name}”？`,
            onOk: () => deleteClassById(data.id),
          });
        };
        const onPanEnd = (event, data) => {
          return updateClasses(data);
        };
        return (
          <ClassCard
            {...props}
            ref="classCard"
            calendar={self.refs.calendar}
            popupEnabled={true}
            popupTemplate={ClassOverview}
            popupProps={{
              onCreateClass: updateClasses,
            }}
            onHide={onHide}
            onPanEnd={onPanEnd}
          />
        );
      }
    }
  }

  setCreateClassTemplate(from, to, date) {
    let timeStringToObject = (timeStr) => {
      const timeStrObj = timeStr.split(':');
      return {
        hour: timeStrObj[0],
        minute: timeStrObj[1],
      };
    }
    const self = this;
    const onCreateClass = this.onCreateClass.bind(this);
    const newClassTemplate = class ClassTemplate extends React.Component {
      render() {
        const newProps = {
          data: {
            date,
            from: timeStringToObject(from),
            to: timeStringToObject(to),
            template: {},
            spots: {},
          },
          ref: (template) => {
            if (template) {
              self.newClassTemplate = template;
            }
          },
          onCreateClass,
        };
        return <NewClassTemplate {...newProps} />;
      }
    };
    this.setState({
      newClassTemplate
    });
  }

  onCreateClass(newClass) {
    this.setState({
      modalVisibled: false,
    });
    this.updateClasses(newClass);
    this.refs.calendar.cancelCreateCard();
  }

  onAddCard(from, to, date) {
    const fromString = getFormatTime(from);
    const toString = getFormatTime(to);
    this.setCreateClassTemplate(fromString, toString, date);
    this.setState({
      modalVisibled: true,
    });
  }

  async updateClasses(newClass) {
    // upsert the class to remote server
    // NOTE(Yorkie): DONT REMOVE THE CLONE, BECAUSE
    // GIAN WILL REMOVE `.id` that will change the id.
    try {
      const res = await client.class.upsert(newClass);
    } catch (err) {
      if (err.code === 'RESOURCE_EXPIRED') {
        UIFramework.Modal.confirm({
          title: `当前数据已过期`,
          content: `当前数据已过期，点击确认刷新`,
          onOk: () => location.reload(),
        });
      }
    }
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
    this.setState({
      modalVisibled: false,
    });
    this.refs.calendar.cancelCreateCard();
    if (this.newClassTemplate) {
      this.newClassTemplate.isModalShow = false;
    }
  }

  render() {
    const cellHeight = getCellHeight();
    let classTempalte;
    if (this.state.newClassTemplate) {
      classTempalte = <this.state.newClassTemplate />;
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
        <UIFramework.Modal
          visible={this.state.modalVisibled}
          title="添加新课程"
          footer=""
          onCancel={this.handleHideModal.bind(this)}>
          {classTempalte}
        </UIFramework.Modal>
      </div>
    );
  }
}

module.exports = WeflexCalendar;
