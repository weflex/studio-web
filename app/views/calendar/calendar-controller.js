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
    this._indexes  = [];
  }
}

exports.CCViewMode = CCViewMode;
exports.CalendarController = CalendarController;
