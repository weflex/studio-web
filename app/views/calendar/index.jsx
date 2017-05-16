"use strict";

import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import Calendar from './calendar';
import { WeekPicker } from './components/week-picker';
import { NewClassTemplate } from './new';
import {
  getCellHeight,
  getFormatTime,
} from './util.js';
import UIFramework from 'weflex-ui';
import { client } from '../../api';
import ClassList from './class-list';
import Template from './components/template';
import ResourcePanel from '../../components/resource-panel';
import './index.css';
import hourminute from 'hourminute';
import {startOfDay, endOfDay} from 'date-fns';

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
      schedule: new ClassList(),
      modalVisibled: false,
    };
  }

  get title() {
    return (
      <WeekPicker context={this}/>
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
          onRelease: (newClass) => this.createClass(newClass)
        }}
        getData={getData}
      />
    );
  }

  render() {
    const cellHeight = getCellHeight();
    return (
      <Calendar ref="calendar"
                ctx={this}
                cellHeight={cellHeight}
                schedule={this.state.schedule} />
    );
  }

  // MARK: - CalendarContext methods

  get viewDate () {
    return this.refs.calendar.state.viewDate;
  }

  get viewMode () {
    return this.refs.calendar.state.viewMode;
  }

  setViewDate (viewDate) {
    this.refs.calendar.setViewDate(viewDate);
    // TODO: avoid calling setState() outside component
    const startOfWeek = moment(this.viewDate).startOf('week');
    const week = _.range(0, 7).map((n) => moment(startOfWeek).add(n, 'days'));
    const indexes = week.map((d) => {
      return {
        raw: d,
        content: d.format('ddd DD')
      };
    });
    this.refs.calendar.setState({indexes});
  }

  // MARK: - CalendarDataSource methods

  async listClasses(startsAt, endsAt) {
    const venue = await client.user.getVenueById();
    const classes = ( await client.class.list({
      where: {
        startsAt: {
          between: [startOfDay(startsAt), endOfDay(endsAt)]
        },
        venueId: venue.id
      },
      include: [
        'trainer',
        'template',
        {
          'orders': ['user']
        },
      ],
      order: 'startsAt ASC'
    }) ).map( (item) => {
      const startsAt = moment(item.startsAt);
      const endsAt = moment(item.endsAt);
      item.date = moment(startsAt).startOf('day');
      item.from = hourminute({hour: startsAt.hour(), minute: startsAt.minute()});
      item.to = hourminute({hour: endsAt.hour(), minute: endsAt.minute()});
      return item;
    });

    const ptSessions = await client.ptSession.list({
      where: {
        startsAt: {
          between: [startsAt.toDate(), endsAt.toDate()]
        },
        venueId: venue.id,
        cancelledAt: {
          exists: false,
        },
      },
      include: [
        'trainer',
        'user',
      ],
    });

    const ptSessionAsClasses = ptSessions.map((session) => {
      const startsAt = moment(session.startsAt);
      const endsAt = moment(startsAt).add(session.durationMinutes, 'minutes');
      const trainerName = session.trainer.fullname.first + session.trainer.fullname.last;
      return {
        template: {
          name: '私教 (' + trainerName + ')',
        },
        trainer: session.trainer,
        date: moment(startsAt).startOf('day'),
        from: hourminute({hour: startsAt.hour(), minute: startsAt.minute()}),
        to: hourminute({hour: endsAt.hour(), minute: endsAt.minute()}),
        orders: [Object.assign(session, {isPT: true})],
        isPT: true,
      };
    });

    const schedule = new ClassList(classes.concat(ptSessionAsClasses));
    this.setState({schedule});
  }

  async updateClass(classUpdates) {
    const etag = classUpdates.modifiedAt;
    const schedule = this.state.schedule;
    const classId = classUpdates.id;
    let results;
    schedule.removeItemById(classId);
    this.setState({schedule});
    try {
      results = await client.class.update(classId, classUpdates, etag);
    } catch (err) {
      UIFramework.Message.error('我们遇到了一个错误');
      console.error(err);
    } finally {
      classUpdates = Object.assign({}, classUpdates, results);
      schedule.addItem(classUpdates);
      this.setState({schedule});
    }
  }

  async deleteClass(classDeletes) {
    const className = classDeletes.template.name;
    const schedule = this.state.schedule;
    const setState = this.setState.bind(this);
    const etag = classDeletes.modifiedAt;
    UIFramework.Modal.confirm({
      title: `你确认要删除课程“${className}”？`,
      content: `你确认要删除课程“${className}”？`,
      onOk: async () => {
        schedule.removeItemById(classDeletes.id);
        setState({schedule});
        try {
          await client.class.delete(classDeletes.id, etag);
        } catch (err) {
          UIFramework.Message.error('我们遇到了一个错误');
          console.error(err);
        }
      }
    });
  }

  async createClass(newClass) {
    const tempId = Math.random().toString(36).slice(2); // alpha-numeric random string
    const dupClass = Object.assign({}, newClass, {id: tempId}); // duplicate class to avoid contaminating remote data
    const schedule = this.state.schedule;
    schedule.addItem(dupClass);
    let results;
    this.setState({schedule}, async () => {
      try {
        results = await client.class.create(newClass);
      } catch (err) {
        UIFramework.Message.error('我们遇到了一个错误');
        console.error(err);
      } finally {
        schedule.removeItemById(tempId);
        newClass = Object.assign({}, newClass, results);
        schedule.addItem(newClass);
        this.setState({schedule});
      }
    });
  }
}

module.exports = WeflexCalendar;
