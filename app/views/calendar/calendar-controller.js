"use strict";

import moment from 'moment';
import keymirror from 'keymirror';
import { range } from 'lodash';
import { client } from '../../api';

const CCViewMode = keymirror({
  'week': null, 
  'day': null
});

class CalendarController {
  constructor () {
    this._viewMode = CCViewMode.week;
    this._viewDate = moment();
    this._calendar = null;
    this._picker   = null;
  }

  async setViewMode (nextViewMode) {
    this._viewMode = nextViewMode;
    this._calendar.setViewMode(nextViewMode);
    const indexes = await this.getIndexes();
    this._calendar.setState({ indexes });
  }

  set viewMode (nextViewMode) {
    this.setViewMode(nextViewMode);
  }

  get viewMode () {
    return this._viewMode;
  }

  async setViewDate (nextViewDate) {
    this._viewDate = nextViewDate;
    this._calendar.setViewDate(nextViewDate);
    const indexes = await this.getIndexes();
    this._calendar.setState({ indexes });
  }

  set viewDate (nextViewDate) {
    this.setViewDate(nextViewDate);
  }

  get viewDate () {
    return this._viewDate;
  }

  setCalendar (nextCalendar) {
    this._calendar = nextCalendar;
  }

  setPicker (nextPicker) {
    this._picker = nextPicker;
  }

  async getIndexes () {
    if (this._viewMode === CCViewMode.week) {
      const startOfWeek = moment(this._viewDate).startOf('week');
      const week = range(0, 7).map((n) => moment(startOfWeek).add(n, 'days'));
      return week.map((d) => {
        return {
          raw: d,
          content: d.format('ddd DD')
        };
      });
    } else {
      const venue = await client.user.getVenueById();
      const trainers = await client.collaborator.list({
        where: {
          venueId: venue.id
        }
      });
      return trainers.map((t) => {
        return {
          raw: t,
          content: t.fullname.first + t.fullname.last
        };
      });
    }
  }
}

exports.CCViewMode = CCViewMode;
exports.CalendarController = CalendarController;
