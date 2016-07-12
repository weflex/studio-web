"use strict";

import moment from 'moment';
import keymirror from 'keymirror';
import { range } from 'lodash';
import { client } from '../../api';

/**
 * @enum CCViewMode
 */
export const CCViewMode = keymirror({
  /**
   * @property {String} week
   */
  'week': null, 
  /**
   * @property {String} day
   */
  'day': null
});

/**
 * @class CalendarController
 */
export class CalendarController {
  /**
   * @method constructor
   */
  constructor () {
    this._viewMode = CCViewMode.week;
    // FIXME(Yorkie): should we use JavaScript's native date to instead of
    // the `Moment` object in the below property `_viewDate`?
    this._viewDate = moment();
    this._calendar = null;
    this._picker   = null;
  }

  /**
   * @method setViewMode
   * @async
   * @param {CCViewMode} nextViewMode
   */
  async setViewMode (nextViewMode) {
    this._viewMode = nextViewMode;
    this._calendar.setViewMode(nextViewMode);
    const indexes = await this.getIndexes();
    this._calendar.setState({ indexes });
  }

  /**
   * The proxy property to the internal method `setViewMode`.
   * @setter viewMode
   */
  set viewMode (nextViewMode) {
    this.setViewMode(nextViewMode);
  }

  /**
   * @getter viewMode
   */
  get viewMode () {
    return this._viewMode;
  }

  /**
   * @method setViewDate
   * @async
   * @param {Moment} nextViewDate
   */
  async setViewDate (nextViewDate) {
    this._viewDate = nextViewDate;
    this._calendar.setViewDate(nextViewDate);
    const indexes = await this.getIndexes();
    this._calendar.setState({ indexes });
  }

  /**
   * @setter viewDate
   */
  set viewDate (nextViewDate) {
    this.setViewDate(nextViewDate);
  }

  /**
   * @getter viewDate
   */
  get viewDate () {
    return this._viewDate;
  }

  /**
   * @method setCalendar
   * @param {CalendarView} nextCalendar - the next view for calendar.
   */
  setCalendar (nextCalendar) {
    this._calendar = nextCalendar;
  }

  /**
   * @method setPicker
   * @param {Picker} nextPicker - the next view for calendar picker.
   */
  setPicker (nextPicker) {
    this._picker = nextPicker;
  }

  /**
   * @method getIndexes
   * @async
   * @return {raw: Moment, content: String}
   */
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
