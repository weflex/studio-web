import moment from 'moment';
import ClassList from './class-list';

/* Calendar Controller */
const CCViewMode = {
  week: 'week',
  day: 'day'
};

class CalendarController {
  constructor () {
    this._schedule = new ClassList();
    this._viewMode = CCViewMode.week;
    this._viewDate = moment();
    this._indexes  = [];
    this._calendar = null;
    this._picker   = null;
  }

  setViewMode (nextViewMode) {
    this._viewMode = nextViewMode;
    this._calendar.setViewMode(nextViewMode);
  }

  set viewMode (nextViewMode) {
    this.setViewMode(nextViewMode);
  }

  get viewMode () {
    return this._viewMode;
  }

  setViewDate (nextViewDate) {
    this._viewDate = nextViewDate;
    this._calendar.setViewDate(nextViewDate);
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
}

exports.CCViewMode = CCViewMode;
exports.CalendarController = CalendarController;
