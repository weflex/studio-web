"use strict";

import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import Calendar from './calendar';
import { WeekPicker } from './components/week-picker';
import { NewClassTemplate } from './new';
import {
  getWeek,
  getCellHeight,
  getFormatTime,
} from './util.js';
import UIFramework from 'weflex-ui';
import { client } from '../../api';
import { CalendarController } from './calendar-controller';
import Map from './class-list';
import Template from './components/template';
import ResourcePanel from '../../components/resource-panel';
import './index.css';

/**
 * @class WeflexCalendar
 * @extends React.Component
 */
class WeflexCalendar extends React.Component {
  constructor(props) {
    super(props);
    moment.locale('zh-cn');
    this.cards = [];
    this.state = {
      schedule: new Map(),
      allClass: new Map(),
      modalVisibled: false,
    };
    this.controller = new CalendarController();
  }

  get title() {
    return (
      <WeekPicker calendar={this.controller}/>
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
      this.state.allClass.addItem(classInfo);
    });

    const schedule = this.getSchedule(classes);
    this.originalSchedule = schedule;
    this.setState({ schedule });
  }

  async componentDidMount() {
    this.controller.setCalendar(this.refs.calendar);
    this.getClassData();
  }

  getSchedule(classes) {
    let schedule = new Map();
    classes.forEach(function (classInfo) {
        schedule.addItem(classInfo);
    });
    return schedule;
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
    this.refs.newClassTemplate.setState({
      data: {
        date,
        from,
        to,
        template: {},
        spot: 0
      }
    });
    this.setState({
      modalVisibled: true,
    });
  }

  async updateClasses(newClass) {
    // upsert the class to remote server
    // NOTE(Yorkie): DONT REMOVE THE CLONE, BECAUSE
    // GIAN WILL REMOVE `.id` that will change the id.
    let res;
    const { schedule } = this.state;
    schedule.addItem(newClass);
    this.setState({ schedule }, async () => {
      try {
        res = await client.class.upsert(newClass);
      } catch (err) {
        if (err.code === 'RESOURCE_EXPIRED') {
        } else {
          UIFramework.Message.error('我们遇到了一个错误');
          console.error(err);
        }
      }
    });
  }

  async deleteClassById(id, modifiedAt) {
    // delete async
    try {
      await client.class.delete(id, modifiedAt);
    } catch (err) {
      if (err.code === 'RESOURCE_EXPIRED') {
      }
    }
    // delete in UI
    this.getClassData();
  }

  handleHideModal() {
    this.setState({
      modalVisibled: false,
    });
    this.refs.calendar.cancelCreateCard();
  }

  render() {
    const cellHeight = getCellHeight();
    const ctx = {
      onCreateClass: this.updateClasses.bind(this),
      onDeleteClass: (event, data) => {
        if (!data || !data.id) {
          return alert('未知错误');
        }
        UIFramework.Modal.confirm({
          title: `你确认要删除课程“${data.template.name}”？`,
          content: `你确认要删除课程“${data.template.name}”？`,
          onOk: this.deleteClassById.bind(this, data.id, data.modifiedAt || Date.now()),
        });
      }
    };
    return (
      <div>
        <Calendar
          ref="calendar"
          ctx={ctx}
          cellHeight={cellHeight}
          schedule={this.state.schedule}
          onAddCard={this.onAddCard.bind(this)}/>
        <UIFramework.Modal
          visible={this.state.modalVisibled}
          title="添加新课程"
          footer=""
          onCancel={this.handleHideModal.bind(this)}>
          <NewClassTemplate
            data={{}}
            ref='newClassTemplate'
            onCreateClass={this.onCreateClass.bind(this)} />
        </UIFramework.Modal>
      </div>
    );
  }
}

module.exports = WeflexCalendar;
